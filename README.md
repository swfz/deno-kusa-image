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

## image

![contribution](contribution.png "alt")

## dev

- run

```
deno run --allow-net --allow-env --watch server.ts
```

- deploy

```
deployctl deploy --project=kusa-image --prod server.ts
```
