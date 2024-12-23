# deno-kusa-image

PNG of GitHub's Contribution Graphs

## url

```
https://kusa-image.deno.dev/?user=swfz
```

or

```
https://kusa-image.deno.dev/swfz
```

### Optional Parameter

| name       | example    | description                           |
| :--------- | :--------- | :------------------------------------ |
| to         | 2024-01-01 | contribution end date                 |
| theme      | dark       | dark mode only. default is light mode |
| past_years | 3          | display for specified number of years |

## image

![contribution](contribution.png "alt")

## dev

- run

```
deno run --allow-net --allow-env --watch server.ts
```

- query GraphQL

e.g)

```
gh api graphql -f query="$(cat contributions.graphql)" -f userName=swfz -f from=2022-01-01T00:00:00Z -f to=2022-12-31T23:59:59Z
gh api graphql -f query="$(cat ratelimit.graphql)"
```


- test(vrt)

```
CI=true deno run dev &

cd vrt
node json-server &

yarn playwright test
```

- deploy

```
deployctl deploy --project=kusa-image --prod server.ts
```
