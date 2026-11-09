"""Update the supplied roadmap in its original Word template."""
from pathlib import Path
import copy, hashlib, shutil
from docx import Document
from docx.shared import RGBColor, Pt
from docx.oxml import OxmlElement
from docx.text.paragraph import Paragraph

ROOT=Path(__file__).resolve().parents[2]
SOURCE=Path(r'C:\Users\phanb\Downloads\THE WITNESS — Environment Kit Roadmap (8 weeks).docx')
OUT=ROOT/'docs/environment-kit/THE-WITNESS-Environment-Kit-Roadmap.docx'
QA=ROOT/'outputs/environment-kit';QA.mkdir(parents=True,exist_ok=True)
backup=ROOT/'docs/environment-kit/reference/original-roadmap.docx'
backup.parent.mkdir(parents=True,exist_ok=True)
if not backup.exists():shutil.copy2(SOURCE,backup)
(QA/'artifact.md').write_text('Reference: '+str(backup)+'\nSHA256: '+hashlib.sha256(backup.read_bytes()).hexdigest()+
 '\nPreserve the original English roadmap structure, section properties and table formatting. Update obsolete assumptions, baseline and phases. No generic redesign.\n',encoding='utf-8')
doc=Document(backup);body=list(doc.element.body)
replacements={
0:'THE WITNESS Environment Kit Development Roadmap',
1:'Updated 9 Nov 2026 · Revision 5 · AI-led production · Q01 required, L04 extension · Quality gates replace the fixed eight-week deadline. Gate 2 is accepted: the playable Q01 blockout passes the full model, browser, craft, graphics and kit regressions on a pinned deterministic build, and the cold standalone keeps the route with all HTTP blocked. Final art remains Phase 4. The original document is retained as a backup.',
3:'Goal. Build an authored, reusable Environment Kit and architecture that can actually be explored. Q01 must support a continuous playable route through a doorway, an interior, stairs and an upper floor or roof, and back to the harbor. Visual quality is judged at player eye height and during movement as well as against the cover-art reference.',
4:'Required slice and extension:',
6:'L04 Galilee shore (Ga 21) is an extension after Q01 meets its gates. It adds basalt, water, boats and nets. It is not a second mandatory scene for an eight-week deadline.',
7:'Jerusalem, L01 Exodus, L02 En Gedi, L03 cistern and L05 prison remain backlog. Reuse is an architectural goal, not a claim that those scenes are already kit-ready or dressed.',
8:'Confirmed production decisions:',
9:'AI performs all build work: scripts, asset generation, conversion, integration, tests and repairs. No human modelling or programming labor is assumed. The old 15–20 hours/week and 120–160 human-hour estimate is withdrawn.',
10:'Quality takes priority over a fixed completion date. Each gate requires evidence. AI generation speed does not by itself certify visual quality, historical accuracy or device performance.',
11:'The game remains on Three.js. Editable sources and glTF/PBR support reuse; a future engine port would still require gameplay and integration work.',
12:'Existing gameplay must be preserved. Run model/source, browser, craft and graphics checks for relevant runtime changes. The full campaign browser suite, craft details, field keyboard, graphics tiers and kit lifecycle/cache/profile suites now pass alongside the Phase 3 traversal, floor/camera collision, legacy save and cold-offline checks.',
13:'Outside the current scope: new character art, mocap, WebGPU migration, Temple Mount, full Legends dressing and cinematic VFX rework. The existing L01 fire and sea shaders are retained.',
17:'3. Look Bible and evidence rules',
18:'Use the existing project evidence vocabulary: [K] Scripture, [L] historical/archaeological source, [G] Catholic teaching, [H] artistic invention, [C] uncertain claim. The original roadmap labels [V] and [D] map to [L] and [H]. Record sources, dates, confidence and reconstruction boundaries per claim.',
19:'Target look: assets/journey-cover.webp guides warm light, weathered surfaces, muted earth colours and atmospheric depth. The regional board now records eight source observations per region with original diagrams and external source-image links; six reproducible pre-kit game views per scene provide the comparison baseline. Archaeological photographs are not redistributed without verified rights.',
20:'Material families per region are art-direction choices. Mark historically supported claims [L] and distinguish reconstruction [H/C].',
24:'4. Technical standards in docs/environment-kit/standards.md',
23:'Region locks control art direction and prevent accidental reuse. They are not absolute archaeological claims that a material could never occur outside its preferred region. Use terrain, season and habitat when selecting vegetation.',
26:'Per-scene budgets remain provisional targets: desktop 1.2 M visible triangles, 250 draw calls and 256 MiB texture memory; mobile balanced 400 k, 120 and 128 MiB. A dedicated 200-module scene is measured on this laptop’s Intel Arc; headless GPU time and texture upload estimates do not certify full-scene FPS or driver residency.',
29:'6. Milestone plan and acceptance gates',
83:'Every catalog entry records its source, region, evidence, licence, priority, collision/access contract, reproducible source, art acceptance and validation evidence. A pipeline sample does not count as final art.',
85:'Loader bundle. WitnessKit.create(T, renderer) creates an owned runtime; init remains available for legacy callers. Addons share engine Three r187. The PBR study has PNG reference, KTX2 plus Meshopt, and a lighter PNG tier. Exact JS/WASM decoders ship locally. Source scripts and encoder checksums make conversion repeatable.',
86:'Manifest-driven scenes. Load with scene-generation/cancellation guards, stable placeholders and explicit ownership of shared resources. Keep existing builders until replacement visuals, collision and gameplay are verified. Do not append an asset to a scene that has already been disposed.',
87:'Height and support. The player now samples the final terrain triangles after seabed and foundation changes. Q01 room, eighteen treads and roof pieces have distinct support IDs. spatialPositions stores x/y/z and support alongside legacy planar positions. Restore validates the real floor and body clearance.',
88:'Collision. Q01 uses an upright capsule against 3D wall, floor, ceiling, stair and guard volumes, with substeps and controlled stepping. Route links preserve floor connectivity. Camera clearance and interaction visibility are checked against the building. Other closed buildings retain the existing planar collision contract.',
89:'Materials. Reuse current PBR terrain. Build only required material families first. Keep shader overlays for documented dust/wear effects. Do not reinterpret the existing AO/roughness/height atlas as a standard metallic ORM map.',
90:'Packs and offline. Use versioned region packs and runtime caching with actual cache writes and failure handling. The lighter standalone build may reduce textures, detail and effects, but retains the same essential accessible architecture and progress semantics. Test without network, including decoder/transcoder dependencies.',
91:'Shadows and atmosphere. Follow-player 44 x 44 m shadows, GTAO, scene LUTs, height fog and up-to-4x render-target MSAA are already integrated. Tune these against new assets; do not schedule a second implementation without evidence.',
93:'Functional acceptance: relevant npm test, npm run test:browser, npm run test:craft-details and npm run test:graphics checks. Add route tests for doors, stairs, floors, ceilings, roofs, camera clipping, save/resume and interactions across levels. Missing evidence keeps a gate open.',
94:'Visual baseline: six recorded views each of Q01 and L04 before kit dressing, plus first-person and traversal checks. Store camera/player parameters and fixture identity with images so comparisons can be repeated.',
95:'Performance: specify actual device, resolution, quality and test duration. Desktop 60 fps and mobile balanced 30 fps remain targets. Record frame-time distribution and repeated scene changes; headless SwiftShader is functional QA, not a phone performance measurement.',
96:'Budget checks: test/kit-budget.cjs checks pack/catalog consistency and static GLB budgets during build. Runtime draw calls, residency, render targets and FPS require separate instrumentation; static asset checks cannot certify them.',
100:'11. Scope decisions and gate evidence',
101:'Gate 0: standards, source ledger and repeatable visual baseline. Gate 1: asset pipeline including loading, transformed collision metadata, texture compression and offline dependencies.',
102:'Gate 2: accepted. The Q01 west-store blockout route works in both camera modes, including W-key movement, roof and stair reloads, blocked cross-floor interaction and cold standalone traversal. Mesh raycasts and bounds independently check rendered floor, body and camera clearance on every recorded route. All existing regression suites pass on the same build; see validation/phase3 and progress.json.',
103:'Gate 3: one playable Q01 look-development corner meets the visual standard. Expand Q01 only after this corner is accepted.',
104:'Gate 4: complete and optimize Q01, validate the lighter offline build, then decide whether to extend L04. A gate stays open when any required test or quality evidence is missing.',
105:'If scope must be reduced, reduce catalog breadth and defer L04 first. Keep the playable Q01 architecture and its quality. Do not make a late week-five decision to claim a one-month schedule.',
106:'12. Immediate development work',
107:'Use docs/environment-kit/roadmap.md as the working roadmap, standards.md as the asset contract, look-bible.md for visual/evidence direction, catalog.csv for asset records and progress.json for gate evidence. Update these with each accepted build.',
108:'Phases 1–2 evidence: twelve repeatable baseline views; sixteen annotated regional observations from eight sources; a 288-triangle PBR module in three quality tiers; hash/mip/colour-space checks; abort, shared-resource and repeated scene-change tests; actual runtime-cache offline reload and a cold standalone decoder test.',
109:'Next: Phase 4 Q01 look development on the playable building. Add authored materials, trim, coherent wear, prop detail and indoor light while preserving the route, saves and camera clearance. The blockout is not accepted final art; phone performance and human playtesting remain separate.'
}
def set_text(element,text):
 p=Paragraph(element,doc._body);p.clear();p.add_run(text)
for i,text in replacements.items():set_text(body[i],text)
# Replace the obsolete weekly schedule as a block, preserving the heading and template.
phases=[
 ('Phase 1 Foundations and baseline','Create the Look Bible, standards, catalogue and repeatable Q01/L04 views. Define required Q01 access and distinguish measured device results from emulated checks.'),
 ('Phase 2 AI asset pipeline','Prove source-to-GLB generation, shared-core loading, instancing, transformed footprints, resource ownership and offline packaging. KTX2, Meshopt and locally bundled codecs now have actual browser tests; retain these checks as the pipeline expands.'),
 ('Phase 3 Playable architecture blockout','Implemented and accepted in Q01: an open 1.9 m doorway, room, eighteen 0.18 m steps and a roof 3.24 m above the floor. A wider bottom approach and top landing keep return navigation clear. Both camera routes, floor-aware saves and network-blocked standalone traversal pass dedicated tests with independent rendered-geometry checks. Other buildings remain closed.'),
 ('Phase 4 Q01 look development','Finish one playable corner with ground, wall base, doorway, quay and props. Review scale, texture repetition, module seams, wear and light at eye height. Do not accept only a beauty screenshot.'),
 ('Phase 5 Complete Q01','Create only the modules and nature/prop assets needed for the required route and scene framing. Preserve quest reachability and validate each replacement before removing its fallback.'),
 ('Phase 6 Optimisation and lighter offline build','Tune LOD, textures, foliage and effects. Keep the same essential walkable interiors, stairs and roof access in the lighter build. Test fresh load, save/resume, scene transitions and missing assets with network blocked.'),
 ('Phase 7 L04 extension','After Q01 passes, extend the kit with basalt, shore, boat and net assets. Define boat boarding or moving-platform behavior separately if included. Preserve Q01 quality.'),
 ('Phase 8 Final evidence and delivery','Run functional and visual checks, static budgets and device-specific profiling. Store evidence against source/build revisions. Record remaining limits. Other scenes remain backlog.')]
anchor=body[29]
for e in body[30:81]:doc.element.body.remove(e)
for heading,description in phases:
 for text,style in [(heading,'Heading 2'),(description,'Normal')]:
  element=OxmlElement('w:p');anchor.addnext(element);anchor=element
  p=Paragraph(element,doc._body);p.style=style;p.add_run(text)
# Revise tables in place, retaining cell layout and paragraph style.
tables=doc.tables
updates={
0:{(1,0):'Shared-core GLTFLoader, KTX2Loader and MeshoptDecoder are bundled against Three r187. GTAO already exists.',(1,1):'vendor/witness-loaders.js and engine core',(1,2):'Reuse the tested pipeline and GTAO. Scene-owned scopes handle abort and shared-resource release.',
 (4,0):'Q01 west store is now a 9 x 8 m playable blockout with room, stairs, roof and an inspectable drying rack. Other houses remain closed.',(4,1):'witness-architecture.js; witness-world.js',(4,2):'Preserve its functional route while authoring the Phase 4 visual corner.',
 (5,0):'Final terrain triangles are sampled after seabed changes and foundation grading.',(5,1):'WitnessArchitecture.terrainSampler',(5,2):'Share the sampler; retain separate support IDs for stacked floors.',
 (6,0):'Q01 has height-aware capsule collision and separate floor supports. Existing scene props retain legacy circle obstacles.',(6,1):'witness-architecture.js; player runtime',(6,2):'Keep floor identity in movement, route planning, camera and interaction.',
 (9,0):'A shared terrain mesh remains the outdoor base; Q01 additionally has a room floor, eighteen treads and three roof support pieces.',(9,2):'Do not reduce stacked floors back to one height(x,z).',
 (7,0):'Terrain already uses four PBR layers with AO/roughness/height atlases. Architecture remains mainly procedural.',(7,2):'Extend material families and authored terrain; do not repeat the initial terrain conversion.',
 (8,0):'Player standalone embeds the active lighter pack. A separate lab standalone proves full KTX2/Meshopt and bundled WASM without HTTP.',(8,2):'Keep immutable asset URLs, refreshable manifests and successful cache writes. Actual service-worker offline reload is tested.',
 (10,0):'noSurface/noCast were removed before material construction.',(10,2):'Keep regression coverage; this warning fix is complete.'},
1:{(1,2):'Kurkar/limestone, plaster, timber and harbor construction are references [L]. Distinguish construction phases from the documented inauguration in 10 BCE. Exact 8 cm / 2 cm dressing dimensions and lighthouse reconstruction require asset-specific sources [C/H].',
 (2,1):'Local basalt, coarse and irregular; mud/earth joints; timber and leaves with pressed-mud roof surfaces. Plaster and later repairs require phase-specific evidence.',
 (2,2):'Custodia describes basalt houses with mud/earth mortar and timber/leaves/pressed-mud roofs. Do not impose a universal dry-stone rule. Capernaum is comparative, not the established location of Ga 21. Museum boat data is comparative; final dimensions need excavation plans.'},
2:{(6,1):'LOD where repetition, screen size and measured scene cost justify it; prioritize large repeated assets and vegetation.',
 (8,1):'AO/wear/wind masks only with an explicit shader contract; ordinary RGB vertex colour remains separate.',
 (9,1):'Local extras.footprint circles transformed per node/instance for 2D obstacles; separate 3D collision and support surfaces for accessible buildings.'},
3:{(3,1):'Basis Universal v2.50 WASI',(3,2):'Pinned encoder with SHA256 verification; ETC1S albedo/ORM and UASTC normal, ten mip levels.',(4,2):'Shared-core GLTF/KTX2 plus Meshopt, owned scene scopes and bundled codecs are tested. Existing GTAO/grade/fog/shadow work is retained.'},
4:{(1,2):'13 candidate families; produce only required Q01 families first',(2,2):'Q01 authored heightmap and path masks; L04 terrain as extension',(3,2):'About 25 candidate modules; build only those needed for Q01 first',(4,0):'EXT',(5,2):'Only nature assets required by Q01 framing first',(6,2):'Q01 hero needs first; boat for L04 extension; tent and windlass as needed by later scenes'},
5:{(1,1):'Q01 required; L04 extension; expand only after playable and visual gates pass.',(2,1):'Reproducible AI scripts, early reference corner and smaller catalogue. No human modelling labor is assumed.',(3,1):'Pin r187, share the engine core, retain actual GLB/KTX2/Meshopt browser tests.',(4,1):'Versioned packs and a lighter build preserving essential playable architecture.',(8,1):'Preserve anchors and verify reachable paths, floor-aware interaction and quest regression after each replacement.'}
}
for ti,changes in updates.items():
 for (r,c),text in changes.items():
  cell=tables[ti].cell(r,c);p=cell.paragraphs[0];p.clear();p.add_run(text)
  for extra in cell.paragraphs[1:]:extra._element.getparent().remove(extra._element)
for table in tables:
 for cell in table.rows[0].cells:
  for p in cell.paragraphs:p.paragraph_format.keep_with_next=True
 for row in table.rows:
  row._tr.get_or_add_trPr().append(OxmlElement('w:cantSplit'))
  for cell in row.cells:
   for p in cell.paragraphs:
    for run in p.runs:
     run.text=run.text.replace('[D]','[H]').replace('[V]','[L]')
doc.add_heading('13 Sources and change record',level=1)
for text in [
 'Revision 5 records Gate 2 acceptance: full regression suites on a deterministic build, independent rendered-geometry checks, and a player standalone slimmed to active assets (about 13 MB). The architecture is original reconstruction [H]. Read phase-3.md and validation/phase3 for the implemented contract and movement evidence. No final art or physical-phone certification is implied.',
 'Working documents: docs/environment-kit/roadmap.md; standards.md; look-bible.md; catalog.csv; progress.json. Code and machine-readable evidence determine implementation status, not this prose alone.',
 'Three.js GLTFLoader: https://threejs.org/docs/pages/GLTFLoader.html',
 'Three.js KTX2Loader: https://threejs.org/docs/pages/KTX2Loader.html',
 'Instancing and spatial culling: https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Vendor/EXT_mesh_gpu_instancing/README.md',
 'Caesarea park source: https://static-en.parks.org.il/wp-content/uploads/2026/02/ENG_Caesarea-Park.pdf',
 'Capernaum source: https://www.custodia.org/en/sanctuaries/capernaum/',
 'Research register: docs/environment-kit/research/references.json and source-register.md. The HTML board uses original illustrative diagrams; restricted source photographs are linked, not redistributed.',
 'Shor et al. 2026: https://doi.org/10.1617/s11527-026-03228-9. Distinguish construction functions and plaster from exposed stone. Area LL storage includes later periods: https://hadashot.iaa.org.il/Report_Detail_Eng.aspx?id=25450.',
 'PBR study source: https://polyhaven.com/a/coral_ground_02 (CC0). This tests porous limestone rendering, not exact Caesarea kurkar. The material and wall remain unaccepted final art.'
]:
 p=doc.add_paragraph(text)
 p.paragraph_format.space_after=Pt(5)
 for run in p.runs:run.font.size=Pt(10)
for name in ['Title','Subtitle','Heading 1','Heading 2','Heading 3']:
 if name in doc.styles:doc.styles[name].font.color.rgb=RGBColor(0,0,0)
doc.save(OUT)
print(OUT)
