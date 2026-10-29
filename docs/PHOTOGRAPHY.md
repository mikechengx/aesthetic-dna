# Photography scenarios and generation prompts

The framing exercise uses **four AI-generated realistic photographic sources**, made with the built-in **imagegen** tool. People are fictional. These images are prepared composition exercises, not actual travel photographs or a continuously navigable 3D reconstruction. Generated landmark geometry is illustrative, not a survey of a real camera location.

All four optimized JPEG sources are saved in **`src/assets/photos.json`**, embedded as data URIs. They load without a third-party image host and remain available in the single-file build and PNG exports. A development copy of each JPEG is also included in the local deliverables folder `摄影练习素材`; that folder is not needed to run the repository.

## Asset set

| Registry key   | Scene                                      | Viewpoint                    | Framing choices                                                 |
| -------------- | ------------------------------------------ | ---------------------------- | --------------------------------------------------------------- |
| `shanghai`     | Person with Oriental Pearl Tower, Shanghai | Eye level                    | Person first; person and landmark; city and sky                 |
| `shanghai-low` | Same fictional traveler and setting        | Low angle, closer foreground | Compare human scale, skyline and horizon                        |
| `coast`        | Traveler, rocks and open sea               | Eye level                    | Person first; environmental story; coastline                    |
| `mountains`    | Hiker, alpine lake and layered peaks       | Wide view                    | Human scale; environmental story; foreground and distant layers |

The Shanghai low-angle image was edited from the eye-level image to preserve the subject and scene while changing camera height and perspective. Other scenes are separate generated assets. The editor explicitly distinguishes **source viewpoint selection** from **cropping**. Choosing a composition preset is a starting point and can be adjusted; it is not treated as a correct answer.

Source images were inspected for anatomy, subject/landmark separation and usable framing space, then normalized and JPEG-encoded for the app. The original generated PNG files remain untouched outside the repository. They were not edited with a hand-drawn substitute.

## Final prompt set

### Shanghai — eye level

Use case: photorealistic-natural. Asset: full-frame 4:3 source photograph for an interactive photography composition exercise. Create one highly realistic editorial travel photograph with strong spatial depth, tangible three-dimensional real-world forms, natural photographic people, NOT cartoon or illustration. Scene: Shanghai waterfront in clear late-afternoon golden light, unmistakable Oriental Pearl Tower fully visible from spire to base across the Huangpu river, with Pudong skyline in the background. Foreground on a spacious waterfront promenade: one fictional adult East Asian woman traveler in an understated off-white jacket, navy trousers and sneakers, standing near the left third at roughly x=0.32 y=0.67, her full body occupies about 38% of frame height, naturally looking toward the skyline. Tower is right-of-center x=.68 with clean separation from her head and complete antenna well inside frame. Broad sky, textured stone promenade, river and airy negative space give many legitimate crops. Eye-level 35mm equivalent documentary camera, realistic skin, anatomically natural hands, detailed hair, real natural perspective, warm/cool balance. A complete scene with a person and a recognizable landmark, without overlaid guides, text, borders, watermarks, UI, labels, collage or multiple panels. Avoid waxy faces, mannequin skin, hyper-saturation and artificial depth-of-field. Return a single landscape image.

### Shanghai — low-angle edit

Edit target: referenced Shanghai waterfront photograph. Keep the same fictional adult East Asian woman in the off-white jacket, navy trousers and sneakers, the same warm evening atmosphere, recognizable Oriental Pearl Tower and realistic Shanghai waterfront setting. Create a second actual camera viewpoint for an interactive composition practice: lower the camera to knee height and move substantially closer to the woman, using a wide-angle low viewpoint looking slightly upward. Her full body occupies around 50% of frame height at the left third, with natural perspective and real clothing, not a distorted giant. The Oriental Pearl Tower remains complete at the right third, its antenna within the frame, clearly separated from her head. The paving stones and railing recede with pronounced perspective, a broad sky occupies the upper portion. This must visibly change camera height and perspective, not simply crop the reference. Photorealistic travel editorial image with strong three-dimensional depth. Single 4:3 landscape image, no overlaid text, UI, frames, typography, guides, watermarks or collage. Preserve natural anatomy and coherent landmark proportions.

### Coast

Use case: photorealistic-natural. Asset: full-frame 4:3 source photograph for an interactive photography composition exercise. One realistic editorial travel photograph with vivid tactile three-dimensional depth, natural photographic humans, NOT cartoon or illustration. An expansive rocky coastline and pale blue sea in soft warm evening light. One fictional adult traveler with short dark hair, a rust-red windbreaker, cream trousers, walking naturally on a safe broad rock platform at the left-center lower third, full body about 30% of frame height. They turn slightly toward the sea. Sweeping coast leads diagonally from lower left toward distant right, delicate waves, textured rocks, layered blue headlands receding far into background, a clean horizon around y=.38. Broad negative space, complete subject feet and head within frame. Eye-level 35mm equivalent editorial lens, realistic anatomy and clothing, balanced high-quality natural photography, ample composition options to isolate person, retain the journey or emphasize the horizon. No text, logos, watermarks, UI, frames or collages. Single landscape image.

### Alpine lake

Use case: photorealistic-natural. Asset: full-frame 4:3 source photograph for an interactive landscape composition exercise. Create one premium realistic photograph of an unbranded alpine lake and mountains at blue-gold dawn, with convincing three-dimensional depth and natural atmospheric perspective. Foreground: textured stones and grasses along the bottom left, a narrow wooden walkway starts lower-center and leads toward a tiny fictional adult hiker in a muted yellow jacket at x=.39 y=.64, full body about 12% frame height. Middle ground: calm lake reflects the mountain ridgeline. Background: several layered mountains, their top safely below y=.12, pale soft-lit sky in upper quarter. Rich but natural forest green, slate blue water, small golden accent. Wide eye-level 28mm equivalent landscape lens, crisp physically realistic rocks, subtle mist, photograph rather than fantasy, no brand or exact claimed real location. Plenty of space to choose foreground, layered depth or person-to-landscape scale. No typography, watermarks, borders, UI, guides or multiple panels. Single landscape image.

## 中文说明

这四张素材由 imagegen 内置工具生成，人物均为虚构。东方明珠提供平视和低机位两个独立视角素材；海岸、山湖各提供一个视角，再用取景框探索不同的表达重点。本版采用写实素材模拟摄影选择，没有实时 3D 相机或自动主体检测。旧版街角插画定格继续保留。报告依据实际机位、画幅、保留面积和你的表达意图写观察，不把预设裁切当作标准答案。
