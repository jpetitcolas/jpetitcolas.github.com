---
layout: post
title: "Updating Elastic Search Mapping on a Live Index"
excerpt: "Elastic Search (ES) excels in guessing types of its indexed fields. Yet, in some specific case, we need to update the mapping manually. Here is how to do such an update, even on a live index!"
illustration: "/img/posts/elastic-search-update-mapping/blue-search.jpg"
illustration_thumbnail: "/img/posts/elastic-search-update-mapping/blue-search-small.jpg"
illustration_author: "Markus Winkler"
unsplash_account: "markuswinkler"
---

Elastic Search (ES) excels in guessing types of its indexed fields. Whether we send it a number or a date, we can query them out of the box. Yet, in some specific case, we have to give ES more details about our inputs.

I faced such an issue recently. I was configuring a Kibana dashboard based on a logs index. I needed a `customerName` filter to get more precise insights about our users behavior. But the `customerName` field was not present in the Kibana field dropdown:

![Missing customerName field in Kibana dashboard](/img/posts/missing-customer-name-filter.png)

First of all, let's check that ES receives this field. To do so, we can query one of our document via the `_search` endpoint:

```sh
http http://localhost:9200/my-index/_search?size=1 | jq '.hits.hits._source'
```

```json
{
    "id": "01d1b73c-6cbf-4561-80fd-90153a0ea3e9",
    "customerId": "d0866639-62f2-4d97-965f-26b37714b5ed",
    "customerName": "Global Corp."
}
```

So, our documents contains the `customerName` field. After several Google searches, I discovered it is due to a mapping issue. Kibana ignores `text` fields for filters. Indeed, a filter aggregates some data, and `text` type is not `aggretable`. Checking type of our missing field, it confirmed that Kibana considers it as a `text`:

``` sh
http http://localhost:9200/my-index/_mapping/field/customerName \
    | jq '.my-index.mappings.customerName'
```

```json
{
    "full_name": "customerName",
    "mapping": {
        "customerName": {
            "type": "text"
        }
    }
}
```

This field is only used as a filter. We don't need any processing of its content, like we would need with more traditional textual data. Digging into the Elastic Search [documentation](https://www.elastic.co/guide/en/elasticsearch/reference/6.8/keyword.html), the `keyword` type would be a better fit for our use case:

> [Keyword types] are typically used for filtering (find all blog posts where status is published), for sorting, and for aggregations. Keyword fields are only searchable by their exact value.

Our index has been in production for months and contains hundreds of thousands of documents. As we need to keep track of all this existing data, we need a way to update our mapping on our live index.

Elastic Search does not allow to update an index mapping once it has been created. We need to work around this limitation.

Our strategy here is to to create a new index with the correct mapping. Then, we would re-index all our existing data into the new index, and finally update our main alias to target our new index.

**Note:** to simplify our Elastic Search requests, we are going to use two useful tools:

* [HTTPie](https://httpie.io/), a dev-friendly and more modern alternative to CURL,
* [jq](https://stedolan.github.io/jq/), the Bash equivalent of `lodash.get` function


## Create New Index With Correct Mapping

First, let's create a new index with the correct mapping:

``` sh
http PUT http://localhost:9200/my-index-mapping_fix <<EOF
{
    "mappings": {
        "properties": {
            "customerName": { "type": "keyword" }
        }
    }
}
EOF
```

```json
{
    "acknowledged": true,
    "index": "my-index-mapping_fix",
    "shards_acknowledged": true
}
```

Checking our new index mapping confirms we use the `keyword` type:

``` sh
http http://localhost:9200/my-index/_mapping/field/customerName \
    | jq '.my-index.mappings.customerName'
```

```json
{
    "full_name": "customerName",
    "mapping": {
        "customerName": {
            "type": "keyword"
        }
    }
}
```

## Re-indexing Data From our Previous Index into our New Index

Our new index is empty: we need to fill it with our former index data. Re-indexing them from the datasource is not possible. It contains logs from CloudWatch, and would then be super slow and quite complex to achieve. Instead, we need to migrate data from our previous index to our new one.

It can be done using the [reindex](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-reindex.html) built-in command. It takes both the source and destination indices as parameters:

```sh
http POST http://localhost:9200/_reindex <<EOL
{
    "source": { "index": "my-index" },
    "dest": { "index": "my-index-mapping_fix" }
}
EOL
```
After a few minutes (depending on the size of your index), the new index should contain same data than the former one:

```sh
http http://localhost:9200/my-index-mapping_fix/_count | jq '.count'
# 191202
```

## Point Alias to our new Index

One of the best Elastic Search practice is to use an alias in front of your indices. Instead of querying directly indices, we query the alias, which targets one or several indices. This extral layer allows to perform some maintenance operations without any downtime. If we need to re-index all our data, or update an index mapping, we can do in background. Once terminated, we update the alias target to point on the new index.

Let's change the target of our `my-index` alias to our new index:

```sh
http POST /_aliases <<EOL
{
    "actions": [
        { "add": { "index": "my-index-mapping_fix", "alias": "my-index" } },
        { "remove": { "index": "my-index-fff56d96", "alias": "my-index" } },
    ]
}
EOL
```

We executed two actions here: we add our new index to the alias and remove the former one from the alias.

An alias may target one or several indices. If we didn't include a `remove` action, executing a search on `my-index` would lead to duplicate results, as results from both indices would be returned.

We are now done! Our index now contains `customerName` as a `keyword`, allowing us to use it as a Kibana filter. And, icing on the cake, it optimizes slightly our overall performances: we removed the analysis of the text values, using only a raw `keyword` value.

