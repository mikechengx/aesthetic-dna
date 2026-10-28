# Artwork and source references

This repository contains original SVG graphics and metadata linking to 16 official movie posters. It does not bundle third-party poster image files. Images load from publisher hosts at runtime. Links were checked on 2026-10-28; publishers may change them later.

## Film posters

| Film                              | Year | Film origin            | Official source                                                                 | Credit                                     |
| --------------------------------- | ---- | ---------------------- | ------------------------------------------------------------------------------- | ------------------------------------------ |
| Amélie                            | 2001 | France                 | [Publisher page](https://www.sonyclassics.com/film/amelie/)                     | Sony Pictures Classics                     |
| Everything Everywhere All at Once | 2022 | United States          | [Publisher page](https://a24films.com/films/everything-everywhere-all-at-once/) | A24                                        |
| Spirited Away                     | 2001 | Japan                  | [Publisher page](https://www.ghibli.jp/works/chihiro/)                          | © 2001 Hayao Miyazaki/Studio Ghibli, NDDTM |
| Parasite                          | 2019 | South Korea            | [Publisher page](https://www.neonrated.com/film/parasite)                       | NEON / CJ Entertainment                    |
| My Neighbor Totoro                | 1988 | Japan                  | [Publisher page](https://www.ghibli.jp/works/totoro/)                           | Studio Ghibli · respective rights holders  |
| Howl’s Moving Castle              | 2004 | Japan                  | [Publisher page](https://www.ghibli.jp/works/howl/)                             | Studio Ghibli · respective rights holders  |
| Kiki’s Delivery Service           | 1989 | Japan                  | [Publisher page](https://www.ghibli.jp/works/majo/)                             | Studio Ghibli · respective rights holders  |
| Princess Mononoke                 | 1997 | Japan                  | [Publisher page](https://www.ghibli.jp/works/mononoke/)                         | Studio Ghibli · respective rights holders  |
| The Wind Rises                    | 2013 | Japan                  | [Publisher page](https://www.ghibli.jp/works/kazetachinu/)                      | Studio Ghibli · respective rights holders  |
| The Tale of the Princess Kaguya   | 2013 | Japan                  | [Publisher page](https://www.ghibli.jp/works/kaguyahime/)                       | Studio Ghibli · respective rights holders  |
| Perfect Days                      | 2023 | Japan / Germany        | [Publisher page](https://www.neonrated.com/film/perfect-days)                   | NEON · respective rights holders           |
| Drive My Car                      | 2021 | Japan                  | [Publisher page](https://www.janusfilms.com/films/2040)                         | Janus Films                                |
| After Yang                        | 2021 | United States          | [Publisher page](https://a24films.com/films/after-yang)                         | A24                                        |
| Past Lives                        | 2023 | United States          | [Publisher page](https://a24films.com/films/past-lives)                         | A24                                        |
| Midsommar                         | 2019 | United States / Sweden | [Publisher page](https://a24films.com/films/midsommar)                          | A24                                        |
| Moonlight                         | 2016 | United States          | [Publisher page](https://a24films.com/films/moonlight)                          | A24                                        |

Full image URLs, stable catalog IDs and browsing tags are in `src/posters.ts`. Film origin labels refer to the film, not a claim about a particular poster edition. The year is the film year; publishers may show re-release artwork.

Movie artwork belongs to its respective rights holders. A link or attribution is not a redistribution or commercial-use license. This project does not claim those rights. Previews preserve the published artwork, use a contained aspect ratio, and are never recolored, translated, included in PNG exports or saved in the session. Selection records whole-poster preferences; it is not scored by film origin.

## Original graphics

- `src/art.ts`: the street scene, interiors, architecture, fashion, materials, courtyard, original screening posters, observation pairs, palette cards and crop SVGs.
- `src/cardDesigns.ts`: original botanical engraving-style graphics, geometric bursts and three editorial layouts. The leaf is decoration, not a biological inference from answers.
- `public/favicon.svg`: original eye mark.
- `tests/poster-fixture.mjs`: an original, clearly labeled test placeholder; never presented as a real movie poster.
- `docs/images/result-series.png`: browser-rendered original cards based on fictional sessions; no real user data or third-party film artwork.

Activities, venues and screening copy are fictional. Fonts come from the operating system; no third-party font binaries are distributed. The scene is illustrated, not a photograph. Reference framing is predefined and does not imply AI object recognition.

## 素材说明

仓库只保留 16 张电影海报的官方链接、署名与浏览标签，不打包原图。电影海报版权归对应权利人，标注来源不代表商业再发行授权。电影年份与国别描述影片本身，不宣称海报具体发行版本。真实海报不进入原创作品或审美卡导出。其他场景、图形与卡面为项目原创；文档预览使用虚构测试作答，字体由系统提供。
