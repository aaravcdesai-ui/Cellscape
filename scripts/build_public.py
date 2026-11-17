"""Build a practice-only public release using an explicit file allowlist."""
from pathlib import Path
import argparse, json, re, shutil
ROOT=Path(__file__).resolve().parent.parent
FILES=['index.html','about.html','NOTICE.md','style.css','app.js','diagram.js','specimens.js','learning.js','lab.js','lab-data.js','studio.js','viewer3d.js','cell-models.js','anatomy-motion.js','experiment-model.js','investigations.js','discovery.js']
ASSETS=['assets/organelles/nucleus.png']+[f'assets/specimens/{n}.png' for n in ['plant','animal','leukocyte','neuron','epithelial','bacteria','muscle']]
VENDOR=[f'vendor/three/{n}' for n in ['LICENSE','three.module.js','three.core.js','OrbitControls.js']]
PRACTICE_JS="""// Public release: no network calls, accounts, or answer persistence.
window.QuizStore={
 begin(model,questions,statusId='quiz-save-status'){
  const node=document.getElementById(statusId);
  if(node)node.textContent='Practice only — answers and scores stay in this page and are not sent to a server.';
 },
 record(){}
};
"""
PRIVACY="""<section id="privacy"><p class="eyebrow">PUBLIC LEARNING EDITION</p><h2>Privacy</h2>
<p>This public version is practice only. Quiz answers, scores, hint requests, experiment predictions, and lesson checks stay in your open page. They are not sent to an answer server. There are no student accounts or public admin dashboard.</p>
<p>Notebook text, saved structures, and review priorities stay in browser memory and reset when you reload or close the page. Download your notebook before leaving if you want to keep it. Images you add are opened locally in your browser and are never uploaded. Snapshot and model downloads are generated in your browser.</p>
<p>The application does not use analytics, advertising, tracking pixels, browser local storage, or application login cookies. Artwork, scripts, and styles are served from the same host. Image generation happened during development; visiting this site does not send prompts or answers to an AI service.</p>
<p>The hosting provider receives ordinary requests needed to deliver the website and may maintain security or access logs under its own policies. External reference sites receive a request only when you follow their links. Outgoing links request that browsers omit referrer information.</p>
<p><strong>Optional feedback:</strong> “Give feedback” opens a separate Google Form in a new tab. The form asks about your experience using Cellscape and does not request your name or email address. Your feedback is sent to the site operator through Google Forms only when you submit it. Please avoid personal information in your comments. Google processes visits and submissions under its <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a>.</p>
<p>The cell models, illustrations, and experiments are simplified teaching aids, not measured reconstructions or clinical tools. Tissue previews are original schematics, not microscope photographs.</p></section>"""
def build(destination):
 destination=destination.resolve()
 if destination==ROOT or ROOT in destination.parents and destination.name not in ('_site','dist'):
  raise ValueError('Use a dedicated _site or dist output directory')
 if destination.exists():
  if destination.is_symlink():raise ValueError('Output must not be a symlink')
  # Only replace an output previously created by this builder.
  if not (destination/'.cellscape-public-build').exists() and any(destination.iterdir()):raise ValueError('Output is not a Cellscape public build')
  shutil.rmtree(destination)
 destination.mkdir(parents=True)
 for name in FILES+ASSETS+VENDOR:
  source=ROOT/name
  if source.is_symlink() or not source.is_file():raise ValueError(f'Unexpected source: {name}')
  target=destination/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
 (destination/'quiz-store.js').write_text(PRACTICE_JS)
 html=(destination/'index.html').read_text()
 html=html.replace('</header><main id="main-content" tabindex="-1">','</header><p class="public-edition" role="note"><strong>Public beta</strong><span>Practice only · Quiz answers stay in this page.</span></p><main id="main-content" tabindex="-1">')
 html=html.replace('quiz-store.js?v=1','quiz-store.js?v=public-1')
 (destination/'index.html').write_text(html)
 about=(destination/'about.html').read_text();start=about.rfind('<section',0,about.index('id="privacy"'))
 # The privacy section is the last content section on this page.
 end=about.index('</section>',about.index('id="privacy"'))+len('</section>')
 about=about[:start]+PRIVACY+about[end:]
 (destination/'about.html').write_text(about)
 with (destination/'style.css').open('a') as out:out.write('\n.public-edition{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin:0;padding:9px 16px;border-bottom:1px solid #dedfcf;background:#edf0e1;color:#63724f;font:11px/1.6 system-ui,sans-serif}.public-edition strong{font-weight:600;color:#4d603b}@media(max-width:650px){.public-edition{gap:4px 10px;font-size:10px}}\n')
 (destination/'.nojekyll').touch();(destination/'.cellscape-public-build').write_text('Practice-only static release\n')
 expected=set(FILES+ASSETS+VENDOR+['quiz-store.js','.nojekyll','.cellscape-public-build'])
 actual={p.relative_to(destination).as_posix() for p in destination.rglob('*') if p.is_file()}
 assert actual==expected,(actual-expected,expected-actual)
 assert 'fetch(' not in (destination/'quiz-store.js').read_text()
 for name in actual:
  assert not any(part in name.lower() for part in ['admin','backend','sqlite','.env','recording','quiz-export'])
 for path in re.findall(r'(?:src|href)="([^"?#]+)',html):
  if path.startswith(('https:','http:','#','/')) or path in ('./',):continue
  assert (destination/path).exists(),path
 print(json.dumps({'directory':str(destination),'files':len(actual),'quizSaving':False,'adminIncluded':False}))
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=ROOT/'_site');args=parser.parse_args();build(args.output)
