const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 7860;

// MongoDB Connection
const mongoURI = "mongodb+srv://hishammon:hishammon@cluster0.2g7bqyf.mongodb.net/AnimeDB?appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("✅ SKILL X STORE Live"))
  .catch(err => console.log(err));

// Database Schema
const HackSchema = new mongoose.Schema({
    hackName: String,
    picPath: String,
    videoPath: String
});
const Hack = mongoose.model('Hack', HackSchema);

app.use(express.json());
// അപ്‌ലോഡ് ചെയ്യുന്ന ഫയലുകൾ വെബ്‌സൈറ്റിൽ കാണിക്കാൻ വേണ്ടി ലിങ്ക് ചെയ്യുന്നു
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ഫയൽ അപ്‌ലോഡ് ചെയ്യാനുള്ള സെറ്റപ്പ് (Multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// MAIN ROUTE
app.get('/', async (req, res) => {
    const allData = await Hack.find();
    res.send(`
    <!DOCTYPE html>
    <html lang="ml">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SKILL X STORE</title>
        <link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet" />
        <style>
            :root { --yellow: #ffea00; --dark: #0a0a0a; --card-bg: #141414; }
            body { margin: 0; background: var(--dark); color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            
            header { padding: 20px; background: #000; border-bottom: 3px solid var(--yellow); text-align: center; position: sticky; top: 0; z-index: 100; box-shadow: 0px 4px 15px rgba(255, 234, 0, 0.15); }
            .logo { color: var(--yellow); font-size: 1.8em; font-weight: 900; letter-spacing: 2px; text-shadow: 0 0 10px rgba(255, 234, 0, 0.5); }
            .search-box { width: 85%; max-width: 500px; padding: 12px 20px; border-radius: 25px; border: 1px solid #333; background: #1a1a1a; color: #fff; margin-top: 15px; outline: none; transition: 0.3s; }
            .search-box:focus { border-color: var(--yellow); box-shadow: 0 0 8px rgba(255, 234, 0, 0.3); }
            
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; padding: 15px; max-width: 1000px; margin: 0 auto; }
            @media (max-width: 480px) { .grid { grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 10px; } }
            
            .card { background: var(--card-bg); border-radius: 12px; overflow: hidden; border: 1px solid #222; position: relative; transition: transform 0.2s; display: flex; flex-direction: column; }
            .card:hover { transform: translateY(-3px); border-color: var(--yellow); }
            
            .pic-box { width: 100%; aspect-ratio: 16/9; background: #000; overflow: hidden; }
            .pic-box img { width: 100%; height: 100%; object-fit: cover; }
            
            .info { padding: 12px; font-size: 0.95em; text-align: center; font-weight: bold; color: #fff; }
            
            /* Overlay Player & Bottom Sheet */
            #playerOverlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 2000; flex-direction: column; justify-content: center; align-items: center; }
            .video-container { width: 100%; max-width: 640px; position: relative; }
            .video-js { width: 100% !important; height: auto; aspect-ratio: 16/9; }
            
            .buy-btn { display: block; width: 80%; max-width: 300px; margin: 20px auto 0 auto; background: var(--yellow); color: #000; text-align: center; padding: 12px; font-weight: bold; font-size: 1.1em; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 15px rgba(255, 234, 0, 0.4); transition: 0.2s; }
            .buy-btn:hover { transform: scale(1.05); }
            
            .close-btn { position: absolute; top: -50px; right: 10px; color: #fff; font-size: 35px; background: none; border: none; cursor: pointer; }
            .fab { position: fixed; bottom: 25px; right: 25px; background: var(--yellow); width: 60px; height: 60px; border-radius: 50%; border: none; font-size: 32px; font-weight: bold; color: #000; cursor: pointer; box-shadow: 0 4px 15px rgba(255, 234, 0, 0.4); z-index: 500; }
            
            /* Hidden Upload Form */
            #uploadModal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 3000; justify-content: center; align-items: center; }
            .modal-content { background: #1c1c1c; padding: 25px; border-radius: 15px; border: 1px solid var(--yellow); width: 85%; max-width: 400px; }
            .modal-content h3 { margin-top: 0; color: var(--yellow); text-align: center; }
            .modal-content input { width: 100%; padding: 10px; margin: 10px 0; box-sizing: border-box; background: #2b2b2b; border: 1px solid #444; color: #fff; border-radius: 5px; }
            .modal-content label { font-size: 0.85em; color: #bbb; }
            .modal-btn { background: var(--yellow); color: #000; font-weight: bold; border: none; padding: 12px; width: 100%; border-radius: 5px; cursor: pointer; margin-top: 10px; }
            .cancel-btn { background: #333; color: #fff; border: none; padding: 10px; width: 100%; border-radius: 5px; cursor: pointer; margin-top: 5px; }
        </style>
    </head>
    <body>
        <header>
            <div class="logo">SKILL X STORE ⚡</div>
            <input type="text" id="srch" class="search-box" placeholder="ഹായ്, എന്താണ് തിരയുന്നത്?">
        </header>
        
        <div class="grid" id="g"></div>
        
        <!-- Video Player Overlay -->
        <div id="playerOverlay">
            <div class="video-container">
                <button class="close-btn" onclick="closeP()">&times;</button>
                <video id="v-player" class="video-js vjs-big-play-centered" controls preload="auto"></video>
                <a href="https://t.me/BZBIXO" target="_blank" class="buy-btn">🛒 BUY NOW</a>
            </div>
        </div>

        <!-- Add Hack Modal -->
        <div id="uploadModal">
            <div class="modal-content">
                <h3>UPLOAD NEW HACK</h3>
                <form id="uploadForm" enctype="multipart/form-data">
                    <input type="text" name="hackName" placeholder="Hack Name" required>
                    <label>Thumbnail Poster (Image):</label>
                    <input type="file" name="pic" accept="image/*" required>
                    <label>Gameplay Video (MP4):</label>
                    <input type="file" name="video" accept="video/*" required>
                    <button type="submit" class="modal-btn">SUBMIT HACK</button>
                    <button type="button" class="cancel-btn" onclick="closeModal()">CANCEL</button>
                </form>
            </div>
        </div>

        <button class="fab" onclick="openAdd()">+</button>
        
        <script src="https://vjs.zencdn.net/8.10.0/video.min.js"></script>
        <script>
            let d = ${JSON.stringify(allData)};
            let player;
            const ADMIN_PASS = "SKILLBYBIXO";

            document.addEventListener('DOMContentLoaded', () => { 
                player = videojs('v-player'); 
                document.getElementById('srch').onkeyup = search;
                load(d);
            });

            function load(list) {
                document.getElementById('g').innerHTML = list.map(i => \`
                    <div class="card">
                        <div style="position:absolute; top:5px; right:5px; z-index:10;">
                            <button onclick="delItem('\${i._id}', event)" style="background:rgba(255,0,0,0.8); color:white; border:none; border-radius:50%; width:28px; height:28px; cursor:pointer; font-weight:bold;">×</button>
                        </div>
                        <div onclick="playVideo('\${i.videoPath}')" style="cursor:pointer; flex: 1;">
                            <div class="pic-box"><img src="\${i.picPath}"></div>
                            <div class="info">\${i.hackName}</div>
                        </div>
                    </div>
                \`).join('');
            }

            function playVideo(url) {
                document.getElementById('playerOverlay').style.display = 'flex';
                player.src({ type: 'video/mp4', src: url });
                player.play();
            }

            function closeP() { 
                player.pause(); 
                document.getElementById('playerOverlay').style.display = 'none'; 
            }

            function search() {
                const val = document.getElementById('srch').value.toLowerCase();
                load(d.filter(i => i.hackName.toLowerCase().includes(val)));
            }

            function openAdd() {
                if(prompt("Password?") !== ADMIN_PASS) {
                    alert("Wrong Password!");
                    return;
                }
                document.getElementById('uploadModal').style.display = 'flex';
            }

            function closeModal() {
                document.getElementById('uploadModal').style.display = 'none';
                document.getElementById('uploadForm').reset();
            }

            document.getElementById('uploadForm').onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                
                // സബ്മിറ്റ് ചെയ്യുമ്പോൾ യൂസർക്ക് മനസ്സിലാവാൻ ലോഡിങ് കാണിക്കുന്നു
                const btn = e.target.querySelector('.modal-btn');
                btn.innerText = "Uploading... Please Wait...";
                btn.disabled = true;

                const res = await fetch('/add', {
                    method: 'POST',
                    body: formData
                });

                if(res.ok) {
                    location.reload();
                } else {
                    alert("Upload Failed!");
                    btn.innerText = "SUBMIT HACK";
                    btn.disabled = false;
                }
            };

            async function delItem(id, event) {
                event.stopPropagation(); // കാർഡിന്റെ ക്ലിക്ക് ഇവന്റ് തടയാൻ
                if(prompt("Password?") !== ADMIN_PASS) {
                    alert("Wrong Password!");
                    return;
                }
                if(confirm("ഈ ഹാക്ക് ഡിലീറ്റ് ചെയ്യണോ?")) { 
                    await fetch('/delete/' + id, { method: 'DELETE' }); 
                    location.reload(); 
                }
            }
        </script>
    </body>
    </html>
    `);
});

// MULTIPLE FILE UPLOAD ROUTE (POSTER & VIDEO)
app.post('/add', upload.fields([{ name: 'pic', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
    try {
        const hackName = req.body.hackName;
        const picPath = '/uploads/' + req.files['pic'][0].filename;
        const videoPath = '/uploads/' + req.files['video'][0].filename;

        await Hack.create({ hackName, picPath, videoPath });
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

// DELETE ROUTE (ഡാറ്റാബേസിൽ നിന്നും ഫയൽ സിസ്റ്റത്തിൽ നിന്നും നീക്കം ചെയ്യും)
app.delete('/delete/:id', async (req, res) => {
    try {
        const item = await Hack.findById(req.params.id);
        if(item) {
            // സെർവറിലെ ഫയലുകൾ ഡിലീറ്റ് ചെയ്യുന്നു
            const pPath = path.join(__dirname, item.picPath);
            const vPath = path.join(__dirname, item.videoPath);
            if(fs.existsSync(pPath)) fs.unlinkSync(pPath);
            if(fs.existsSync(vPath)) fs.unlinkSync(vPath);
            
            await Hack.findByIdAndDelete(req.params.id);
        }
        res.sendStatus(200);
    } catch (err) {
        res.sendStatus(500);
    }
});

app.listen(PORT, () => console.log("✅ SKILL X STORE Running on port " + PORT));
