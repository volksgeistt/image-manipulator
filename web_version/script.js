let canvas;
let undoStack = [];
let redoStack = [];
let isDrawingCrop = false;
let cropRect = null;

function initCanvas() {
    const container = document.querySelector('.canvas-container');
    const width = container.clientWidth - 50;
    const height = container.clientHeight - 50;

    canvas = new fabric.Canvas('canvas', {
        width: width,
        height: height,
        backgroundColor: '#1a1a24',
        preserveObjectStacking: true
    });

    window.addEventListener('resize', debounce(resizeCanvas, 250));
}

function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function saveState() {
    undoStack.push(JSON.stringify(canvas));
    redoStack = [];
    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    document.getElementById('undoBtn').disabled = undoStack.length === 0;
    document.getElementById('redoBtn').disabled = redoStack.length === 0;
}

function undo() {
    if (undoStack.length > 0) {
        redoStack.push(JSON.stringify(canvas));
        canvas.loadFromJSON(undoStack.pop(), function() {
            canvas.renderAll();
            updateUndoRedoButtons();
        });
    }
}

function redo() {
    if (redoStack.length > 0) {
        undoStack.push(JSON.stringify(canvas));
        canvas.loadFromJSON(redoStack.pop(), function() {
            canvas.renderAll();
            updateUndoRedoButtons();
        });
    }
}

function setupEventListeners() {
    document.getElementById('uploadBtn').onclick = () => document.getElementById('fileInput').click();
    document.getElementById('fileInput').onchange = handleImageUpload;
    document.getElementById('saveBtn').onclick = saveImage;

    document.getElementById('undoBtn').onclick = undo;
    document.getElementById('redoBtn').onclick = redo;

    document.getElementById('blurBtn').onclick = () => applyFilter('blur');
    document.getElementById('sharpenBtn').onclick = () => applyFilter('sharpen');
    document.getElementById('invertBtn').onclick = () => applyFilter('invert');
    document.getElementById('bwBtn').onclick = () => applyFilter('blackwhite');
    document.getElementById('glitchBtn').onclick = applyGlitchEffect;
    document.getElementById('neonBtn').onclick = applyNeonEffect;
    document.getElementById('pixelateBtn').onclick = () => applyFilter('pixelate');
    document.getElementById('synthwaveBtn').onclick = applySynthwaveEffect;
    document.getElementById('scanlineBtn').onclick = applyScanlineEffect;
    document.getElementById('matrixBtn').onclick = applyMatrixEffect;

    document.getElementById('rotateLeftBtn').onclick = () => rotateImage(-90);
    document.getElementById('rotateRightBtn').onclick = () => rotateImage(90);
    document.getElementById('flipHBtn').onclick = () => flipImage('horizontal');
    document.getElementById('flipVBtn').onclick = () => flipImage('vertical');
    document.getElementById('cropBtn').onclick = startCrop;
    document.getElementById('circleCropBtn').onclick = circleCrop;

    document.getElementById('brightnessSlider').oninput = updateBrightness;
    document.getElementById('contrastSlider').oninput = updateContrast;
    document.getElementById('rainbowBtn').onclick = applyRainbowEffect;
    document.getElementById('vintageBtn').onclick = applyVintageEffect;
    document.getElementById('cyberpunkBtn').onclick = applyCyberpunkEffect;
    document.getElementById('vaporwaveBtn').onclick = applyVaporwaveEffect;
    document.getElementById('hologramBtn').onclick = applyHologramEffect;
    document.getElementById('retroBtn').onclick = applyRetroEffect;
    document.getElementById('noiseBtn').onclick = applyNoiseEffect;
    document.getElementById('duotoneBtn').onclick = applyDuotoneEffect;
    document.getElementById('outrunBtn').onclick = applyOutrunEffect;
    document.getElementById('acidBtn').onclick = applyAcidEffect;
    document.getElementById('oilpaintBtn').onclick = applyOilPaintEffect;
    document.getElementById('comicBtn').onclick = applyComicEffect;
    document.getElementById('nightvisionBtn').onclick = applyNightVisionEffect;
    document.getElementById('bitwiseBtn').onclick = applyBitwiseEffect;
    document.getElementById('vhsBtn').onclick = applyVHSEffect;

    document.getElementById('seventyBtn').onclick = applySeventyEffect;
    document.getElementById('posterizeBtn').onclick = applyPosterizeEffect;
    document.getElementById('polaroidBtn').onclick = applyPolaroidEffect;
    document.getElementById('technoBtn').onclick = applyTechnoEffect;
    document.getElementById('infraredBtn').onclick = applyInfraredEffect;
    document.getElementById('mirrorBtn').onclick = applyMirrorEffect;
    document.getElementById('watercolorBtn').onclick = applyWatercolorEffect;
    document.getElementById('blueprintBtn').onclick = applyBlueprintEffect;
    document.getElementById('pixelsortBtn').onclick = applyPixelSortEffect;
    document.getElementById('chromographBtn').onclick = applyChromographEffect;
    document.getElementById('anaglyph3dBtn').onclick = applyAnaglyph3DEffect;
    document.getElementById('mosaicBtn').onclick = applyMosaicEffect;
    document.getElementById('printBtn').onclick = applyPrintEffect;

    document.getElementById('heatmapBtn').onclick = applyHeatmapEffect;
    document.getElementById('stainedglassBtn').onclick = applyStainedGlassEffect;
    document.getElementById('etchingBtn').onclick = applyEtchingEffect;
    document.getElementById('plasticBtn').onclick = applyPlasticEffect;
    document.getElementById('aquariumBtn').onclick = applyAquariumEffect;
    document.getElementById('parchmentBtn').onclick = applyParchmentEffect;
    document.getElementById('frostedglassBtn').onclick = applyFrostedGlassEffect;
    document.getElementById('cosmicBtn').onclick = applyCosmicEffect;
    document.getElementById('paintbynumbersBtn').onclick = applyPaintByNumbersEffect;
    document.getElementById('metallicBtn').onclick = applyMetallicEffect;
    document.getElementById('gothicBtn').onclick = applyGothicEffect;
    document.getElementById('lithographBtn').onclick = applyLithographEffect;
    document.getElementById('stencilBtn').onclick = applyStencilEffect;
    document.getElementById('chalkboardBtn').onclick = applyChalkboardEffect;
    document.getElementById('impastoBtn').onclick = applyImpastoEffect;

}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    showLoading();
    const reader = new FileReader();
    
    reader.onload = function(event) {
        fabric.Image.fromURL(event.target.result, function(img) {
            canvas.clear();
            const scale = Math.min(
                canvas.width / img.width,
                canvas.height / img.height
            ) * 0.9;
            
            img.scale(scale);
            img.center();
            canvas.add(img);
            canvas.renderAll();
            saveState();
            hideLoading();
        });
    };
    reader.readAsDataURL(file);
}

function saveImage() {
    const link = document.createElement('a');
    link.download = 'cyberpunk-edit.png';
    link.href = canvas.toDataURL({
        format: 'png',
        quality: 1
    });
    link.click();
}

function applyFilter(type) {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    if (!img.filters) img.filters = [];

    switch(type) {
        case 'blur':
            img.filters.push(new fabric.Image.filters.Blur({ blur: 0.5 }));
            break;
        case 'sharpen':
            img.filters.push(new fabric.Image.filters.Convolute({
                matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0]
            }));
            break;
        case 'invert':
            img.filters.push(new fabric.Image.filters.Invert());
            break;
        case 'blackwhite':
            img.filters.push(new fabric.Image.filters.Grayscale());
            break;
        case 'pixelate':
            img.filters.push(new fabric.Image.filters.Pixelate({
                blocksize: 8
            }));
            break;
    }

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyGlitchEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    const originalFilters = [...(img.filters || [])];
    img.filters = [
        new fabric.Image.filters.BlendColor({
            color: '#ff0000',
            mode: 'multiply',
            alpha: 0.3
        }),
        new fabric.Image.filters.Displacement({
            scale: 20,
            offset: new fabric.Point(10, 0)
        })
    ];

    setTimeout(() => {
        img.filters = originalFilters;
        img.applyFilters();
        canvas.renderAll();
        hideLoading();
    }, 50);

    img.applyFilters();
    canvas.renderAll();
}

function applyRainbowEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.BlendColor({
            color: '#ff0000',
            mode: 'multiply',
            alpha: 0.2
        }),
        new fabric.Image.filters.Gradient({
            type: 'linear',
            colorStops: [
                { offset: 0, color: '#ff0000' },
                { offset: 0.2, color: '#ffa500' },
                { offset: 0.4, color: '#ffff00' },
                { offset: 0.6, color: '#00ff00' },
                { offset: 0.8, color: '#0000ff' },
                { offset: 1, color: '#ff00ff' }
            ]
        })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyVintageEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Sepia(),
        new fabric.Image.filters.Noise({ noise: 25 }),
        new fabric.Image.filters.Brightness({ brightness: -0.1 }),
        new fabric.Image.filters.Contrast({ contrast: 0.1 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyCyberpunkEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.BlendColor({
            color: '#00ffff',
            mode: 'overlay',
            alpha: 0.3
        }),
        new fabric.Image.filters.BlendColor({
            color: '#ff00ff',
            mode: 'screen',
            alpha: 0.2
        }),
        new fabric.Image.filters.Contrast({ contrast: 0.3 }),
        new fabric.Image.filters.Brightness({ brightness: 0.1 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyVaporwaveEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.BlendColor({
            color: '#ff71ce',
            mode: 'multiply',
            alpha: 0.2
        }),
        new fabric.Image.filters.BlendColor({
            color: '#01cdfe',
            mode: 'screen',
            alpha: 0.2
        }),
        new fabric.Image.filters.Saturation({ saturation: 0.5 }),
        new fabric.Image.filters.Contrast({ contrast: 0.15 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyHologramEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.BlendColor({
            color: '#00ffff',
            mode: 'screen',
            alpha: 0.4
        }),
        new fabric.Image.filters.Noise({ noise: 30 }),
        new fabric.Image.filters.Blur({ blur: 0.2 })
    );

    const scanlines = new fabric.Rect({
        width: canvas.width,
        height: canvas.height,
        fill: new fabric.Pattern({
            source: createHologramPattern(),
            repeat: 'repeat-y'
        }),
        opacity: 0.2
    });

    canvas.add(scanlines);
    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function createHologramPattern() {
    const patternCanvas = document.createElement('canvas');
    const ctx = patternCanvas.getContext('2d');
    patternCanvas.width = 2;
    patternCanvas.height = 4;
    
    ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.fillRect(0, 0, 2, 1);
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 1, 2, 3);
    
    return patternCanvas;
}

function applySeventyEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Sepia(),
        new fabric.Image.filters.BlendColor({
            color: '#ffae42',
            mode: 'overlay',
            alpha: 0.3
        }),
        new fabric.Image.filters.Contrast({ contrast: 0.1 }),
        new fabric.Image.filters.Saturation({ saturation: -0.2 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyPosterizeEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Contrast({ contrast: 0.8 }),
        new fabric.Image.filters.Gamma({ gamma: [2, 2, 2] }),
        new fabric.Image.filters.Brightness({ brightness: 0.1 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyPolaroidEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Brightness({ brightness: 0.1 }),
        new fabric.Image.filters.Contrast({ contrast: 0.05 }),
        new fabric.Image.filters.Saturation({ saturation: -0.1 }),
        new fabric.Image.filters.BlendColor({
            color: '#fff5e1',
            mode: 'overlay',
            alpha: 0.3
        })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyTechnoEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.BlendColor({
            color: '#00ff00',
            mode: 'screen',
            alpha: 0.3
        }),
        new fabric.Image.filters.Contrast({ contrast: 0.4 }),
        new fabric.Image.filters.Noise({ noise: 10 }),
        new fabric.Image.filters.Pixelate({ blocksize: 4 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyInfraredEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Grayscale(),
        new fabric.Image.filters.BlendColor({
            color: '#ff0000',
            mode: 'screen',
            alpha: 0.5
        }),
        new fabric.Image.filters.Contrast({ contrast: 0.3 }),
        new fabric.Image.filters.Brightness({ brightness: 0.1 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyMirrorEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.BlendColor({
            color: '#0099ff',
            mode: 'screen',
            alpha: 0.2
        }),
        new fabric.Image.filters.Brightness({ brightness: 0.05 }),
        new fabric.Image.filters.Contrast({ contrast: 0.1 })
    );

    const reflection = new fabric.Image(img.getElement(), {
        filters: img.filters,
        flipY: true,
        opacity: 0.4
    });

    canvas.add(reflection);
    reflection.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyWatercolorEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Blur({ blur: 0.1 }),
        new fabric.Image.filters.Contrast({ contrast: 0.1 }),
        new fabric.Image.filters.Saturation({ saturation: 0.3 }),
        new fabric.Image.filters.Convolute({
            matrix: [0.1, 0.1, 0.1,
                    0.1, 0.2, 0.1,
                    0.1, 0.1, 0.1]
        })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyBlueprintEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Grayscale(),
        new fabric.Image.filters.BlendColor({
            color: '#0066cc',
            mode: 'multiply',
            alpha: 0.8
        }),
        new fabric.Image.filters.Contrast({ contrast: 0.3 }),
        new fabric.Image.filters.Brightness({ brightness: 0.1 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyPixelSortEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Pixelate({ blocksize: 4 }),
        new fabric.Image.filters.Contrast({ contrast: 0.4 }),
        new fabric.Image.filters.BlendColor({
            color: '#ff00ff',
            mode: 'overlay',
            alpha: 0.2
        })
    );

    img.filters.push(
        new fabric.Image.filters.Displacement({
            scale: 20,
            offset: new fabric.Point(10, 0)
        })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyHeatmapEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Grayscale(),
        new fabric.Image.filters.BlendColor({
            color: '#ff0000',
            mode: 'overlay',
            alpha: 0.5
        }),
        new fabric.Image.filters.Gradient({
            type: 'linear',
            colorStops: [
                { offset: 0, color: '#000080' },
                { offset: 0.5, color: '#ff0000' },
                { offset: 1, color: '#ffff00' }
            ]
        })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyStainedGlassEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Contrast({ contrast: 0.3 }),
        new fabric.Image.filters.Saturation({ saturation: 0.5 }),
        new fabric.Image.filters.Convolute({
            matrix: [1, 1, 1,
                    1, 0.7, -1,
                    -1, -1, -1]
        }),
        new fabric.Image.filters.BlendColor({
            color: '#4a90e2',
            mode: 'overlay',
            alpha: 0.2
        })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyEtchingEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Grayscale(),
        new fabric.Image.filters.Contrast({ contrast: 0.5 }),
        new fabric.Image.filters.Convolute({
            matrix: [-1, -1, -1,
                    -1,  8, -1,
                    -1, -1, -1]
        }),
        new fabric.Image.filters.Brightness({ brightness: -0.1 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyPlasticEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Contrast({ contrast: 0.3 }),
        new fabric.Image.filters.Saturation({ saturation: 0.4 }),
        new fabric.Image.filters.Brightness({ brightness: 0.1 }),
        new fabric.Image.filters.BlendColor({
            color: '#ffffff',
            mode: 'overlay',
            alpha: 0.3
        })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyAquariumEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.BlendColor({
            color: '#00ffff',
            mode: 'screen',
            alpha: 0.3
        }),
        new fabric.Image.filters.Blur({ blur: 0.2 }),
        new fabric.Image.filters.Brightness({ brightness: 0.1 })
    );

    const ripple = new fabric.Rect({
        width: canvas.width,
        height: canvas.height,
        fill: new fabric.Pattern({
            source: createRipplePattern(),
            repeat: 'repeat'
        }),
        opacity: 0.2
    });

    canvas.add(ripple);
    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function createRipplePattern() {
    const patternCanvas = document.createElement('canvas');
    const ctx = patternCanvas.getContext('2d');
    patternCanvas.width = 10;
    patternCanvas.height = 10;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(5, 5, 3, 0, Math.PI * 2);
    ctx.stroke();
    
    return patternCanvas;
}

function applyParchmentEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Sepia(),
        new fabric.Image.filters.Contrast({ contrast: -0.1 }),
        new fabric.Image.filters.BlendColor({
            color: '#f4d03f',
            mode: 'multiply',
            alpha: 0.2
        }),
        new fabric.Image.filters.Noise({ noise: 10 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyFrostedGlassEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Blur({ blur: 0.3 }),
        new fabric.Image.filters.Brightness({ brightness: 0.1 }),
        new fabric.Image.filters.BlendColor({
            color: '#ffffff',
            mode: 'screen',
            alpha: 0.3
        }),
        new fabric.Image.filters.Noise({ noise: 15 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyCosmicEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.BlendColor({
            color: '#663399',
            mode: 'overlay',
            alpha: 0.3
        }),
        new fabric.Image.filters.Brightness({ brightness: -0.1 }),
        new fabric.Image.filters.Contrast({ contrast: 0.2 }),
        new fabric.Image.filters.Noise({ noise: 20 })
    );

    const stars = new fabric.Rect({
        width: canvas.width,
        height: canvas.height,
        fill: new fabric.Pattern({
            source: createStarPattern(),
            repeat: 'repeat'
        }),
        opacity: 0.4
    });

    canvas.add(stars);
    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function createStarPattern() {
    const patternCanvas = document.createElement('canvas');
    const ctx = patternCanvas.getContext('2d');
    patternCanvas.width = 100;
    patternCanvas.height = 100;
    
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, 1, 1);
    }
    
    return patternCanvas;
}

function applyPaintByNumbersEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Posterize({ levels: 5 }),
        new fabric.Image.filters.Contrast({ contrast: 0.3 }),
        new fabric.Image.filters.Convolute({
            matrix: [-1, -1, -1,
                    -1,  8, -1,
                    -1, -1, -1]
        })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyMetallicEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Grayscale(),
        new fabric.Image.filters.Contrast({ contrast: 0.4 }),
        new fabric.Image.filters.BlendColor({
            color: '#808080',
            mode: 'overlay',
            alpha: 0.5
        }),
        new fabric.Image.filters.Brightness({ brightness: 0.1 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyGothicEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Contrast({ contrast: 0.3 }),
        new fabric.Image.filters.Brightness({ brightness: -0.2 }),
        new fabric.Image.filters.BlendColor({
            color: '#000000',
            mode: 'multiply',
            alpha: 0.3
        }),
        new fabric.Image.filters.Saturation({ saturation: -0.2 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyLithographEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Grayscale(),
        new fabric.Image.filters.Contrast({ contrast: 0.5 }),
        new fabric.Image.filters.Brightness({ brightness: 0.1 }),
        new fabric.Image.filters.Noise({ noise: 10 })
    );

    const texture = new fabric.Rect({
        width: canvas.width,
        height: canvas.height,
        fill: new fabric.Pattern({
            source: createLithographPattern(),
            repeat: 'repeat'
        }),
        opacity: 0.15
    });

    canvas.add(texture);
    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function createLithographPattern() {
    const patternCanvas = document.createElement('canvas');
    const ctx = patternCanvas.getContext('2d');
    patternCanvas.width = 5;
    patternCanvas.height = 5;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, 2, 2);
    
    return patternCanvas;
}

function applyStencilEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Contrast({ contrast: 0.8 }),
        new fabric.Image.filters.Brightness({ brightness: -0.1 }),
        new fabric.Image.filters.Grayscale(),
        new fabric.Image.filters.Threshold({ threshold: 127 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyChalkboardEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Invert(),
        new fabric.Image.filters.Contrast({ contrast: 0.3 }),
        new fabric.Image.filters.BlendColor({
            color: '#003300',
            mode: 'multiply',
            alpha: 0.9
        }),
        new fabric.Image.filters.Noise({ noise: 15 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyImpastoEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Contrast({ contrast: 0.4 }),
        new fabric.Image.filters.Convolute({
            matrix: [1, 1, 1,
                    1, 0.7, -1,
                    -1, -1, -1]
        }),
        new fabric.Image.filters.Noise({ noise: 20 })
    );

    const texture = new fabric.Rect({
        width: canvas.width,
        height: canvas.height,
        fill: new fabric.Pattern({
            source: createImpastoPattern(),
            repeat: 'repeat'
        }),
        opacity: 0.3
    });

    canvas.add(texture);
    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function createImpastoPattern() {
    const patternCanvas = document.createElement('canvas');
    const ctx = patternCanvas.getContext('2d');
    patternCanvas.width = 10;
    patternCanvas.height = 10;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(
            Math.random() * 10,
            Math.random() * 10,
            Math.random() * 3,
            Math.random() * 3
        );
    }
    
    return patternCanvas;
}

function applyChromographEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Saturation({ saturation: 0.5 }),
        new fabric.Image.filters.BlendColor({
            color: '#ff0000',
            mode: 'screen',
            alpha: 0.3
        }),
        new fabric.Image.filters.BlendColor({
            color: '#00ff00',
            mode: 'multiply',
            alpha: 0.2
        }),
        new fabric.Image.filters.Contrast({ contrast: 0.2 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyAnaglyph3DEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    const redChannel = new fabric.Image(img.getElement(), {
        filters: [
            new fabric.Image.filters.BlendColor({
                color: '#ff0000',
                mode: 'multiply',
                alpha: 0.9
            })
        ]
    });

    const cyanChannel = new fabric.Image(img.getElement(), {
        filters: [
            new fabric.Image.filters.BlendColor({
                color: '#00ffff',
                mode: 'multiply',
                alpha: 0.9
            })
        ],
        left: img.left + 5
    });

    canvas.remove(img);
    canvas.add(redChannel, cyanChannel);
    redChannel.applyFilters();
    cyanChannel.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyMosaicEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Pixelate({ blocksize: 12 }),
        new fabric.Image.filters.Contrast({ contrast: 0.2 }),
        new fabric.Image.filters.Saturation({ saturation: 0.3 }),
        new fabric.Image.filters.BlendColor({
            color: '#ffcc00',
            mode: 'overlay',
            alpha: 0.1
        })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyPrintEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Grayscale(),
        new fabric.Image.filters.Contrast({ contrast: 0.4 }),
        new fabric.Image.filters.Noise({ noise: 20 }),
        new fabric.Image.filters.Pixelate({ blocksize: 2 })
    );

    const pattern = new fabric.Rect({
        width: canvas.width,
        height: canvas.height,
        fill: new fabric.Pattern({
            source: createDotPattern(),
            repeat: 'repeat'
        }),
        opacity: 0.3
    });

    canvas.add(pattern);
    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function createDotPattern() {
    const patternCanvas = document.createElement('canvas');
    const ctx = patternCanvas.getContext('2d');
    patternCanvas.width = 4;
    patternCanvas.height = 4;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(2, 2, 1, 0, Math.PI * 2);
    ctx.fill();
    
    return patternCanvas;
}

function applyRetroEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Pixelate({ blocksize: 6 }),
        new fabric.Image.filters.Contrast({ contrast: 0.3 }),
        new fabric.Image.filters.Saturation({ saturation: 0.3 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyNoiseEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Noise({ noise: 50 }),
        new fabric.Image.filters.Contrast({ contrast: 0.1 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyDuotoneEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Grayscale(),
        new fabric.Image.filters.BlendColor({
            color: '#ff0099',
            mode: 'overlay',
            alpha: 0.7
        }),
        new fabric.Image.filters.BlendColor({
            color: '#00ff99',
            mode: 'multiply',
            alpha: 0.3
        })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyOilPaintEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Convolute({
            matrix: [1/9, 1/9, 1/9,
                    1/9, 1/9, 1/9,
                    1/9, 1/9, 1/9]
        }),
        new fabric.Image.filters.Contrast({ contrast: 0.2 }),
        new fabric.Image.filters.Saturation({ saturation: 0.3 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyComicEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Contrast({ contrast: 0.5 }),
        new fabric.Image.filters.Saturation({ saturation: 0.5 }),
        new fabric.Image.filters.Convolute({
            matrix: [-1, -1, -1,
                    -1,  9, -1,
                    -1, -1, -1]
        })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyNightVisionEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Grayscale(),
        new fabric.Image.filters.BlendColor({
            color: '#00ff00',
            mode: 'multiply',
            alpha: 0.5
        }),
        new fabric.Image.filters.Noise({ noise: 20 }),
        new fabric.Image.filters.Brightness({ brightness: -0.1 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyBitwiseEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Contrast({ contrast: 0.8 }),
        new fabric.Image.filters.Grayscale(),
        new fabric.Image.filters.Brightness({ brightness: 0.1 }),
        new fabric.Image.filters.BlendColor({
            color: '#00ff00',
            mode: 'screen',
            alpha: 0.3
        })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyVHSEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Noise({ noise: 15 }),
        new fabric.Image.filters.Blur({ blur: 0.2 }),
        new fabric.Image.filters.BlendColor({
            color: '#ff0000',
            mode: 'multiply',
            alpha: 0.1
        })
    );

    const scanlines = new fabric.Rect({
        width: canvas.width,
        height: canvas.height,
        fill: new fabric.Pattern({
            source: createVHSPattern(),
            repeat: 'repeat-y'
        }),
        opacity: 0.2
    });

    canvas.add(scanlines);
    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function createVHSPattern() {
    const patternCanvas = document.createElement('canvas');
    const ctx = patternCanvas.getContext('2d');
    patternCanvas.width = 8;
    patternCanvas.height = 8;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, 8, 1);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    ctx.fillRect(0, 2, 8, 1);
    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.fillRect(0, 4, 8, 1);
    
    return patternCanvas;
}


function applyOutrunEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.BlendColor({
            color: '#ff2a6d',
            mode: 'overlay',
            alpha: 0.3
        }),
        new fabric.Image.filters.BlendColor({
            color: '#05d9e8',
            mode: 'screen',
            alpha: 0.2
        }),
        new fabric.Image.filters.Contrast({ contrast: 0.2 }),
        new fabric.Image.filters.Saturation({ saturation: 0.3 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyAcidEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Saturation({ saturation: 1 }),
        new fabric.Image.filters.Contrast({ contrast: 0.4 }),
        new fabric.Image.filters.Hue({ rotation: 180 }),
        new fabric.Image.filters.BlendColor({
            color: '#ff00ff',
            mode: 'overlay',
            alpha: 0.3
        })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyNeonEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.Brightness({ brightness: 0.1 }),
        new fabric.Image.filters.Contrast({ contrast: 0.2 }),
        new fabric.Image.filters.Saturation({ saturation: 0.5 }),
        new fabric.Image.filters.Gamma({ gamma: [1.2, 1, 1.4] })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applySynthwaveEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.BlendColor({
            color: '#ff00ff',
            mode: 'overlay',
            alpha: 0.3
        }),
        new fabric.Image.filters.Contrast({ contrast: 0.2 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function applyScanlineEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    const scanlines = new fabric.Rect({
        width: canvas.width,
        height: canvas.height,
        fill: new fabric.Pattern({
            source: createScanlinePattern(),
            repeat: 'repeat'
        }),
        opacity: 0.3
    });

    canvas.add(scanlines);
    canvas.renderAll();
    hideLoading();
}

function createScanlinePattern() {
    const patternCanvas = document.createElement('canvas');
    const ctx = patternCanvas.getContext('2d');
    patternCanvas.width = 1;
    patternCanvas.height = 4;
    
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 1, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, 1, 2);
    
    return patternCanvas;
}

function applyMatrixEffect() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    showLoading();
    saveState();

    img.filters.push(
        new fabric.Image.filters.BlendColor({
            color: '#00ff00',
            mode: 'multiply',
            alpha: 0.3
        }),
        new fabric.Image.filters.Contrast({ contrast: 0.3 }),
        new fabric.Image.filters.Brightness({ brightness: -0.1 })
    );

    img.applyFilters();
    canvas.renderAll();
    hideLoading();
}

function rotateImage(angle) {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    saveState();
    img.rotate((img.angle || 0) + angle);
    canvas.renderAll();
}

function flipImage(direction) {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    saveState();
    if (direction === 'horizontal') {
        img.flipX = !img.flipX;
    } else {
        img.flipY = !img.flipY;
    }
    canvas.renderAll();
}

function startCrop() {
    if (isDrawingCrop) {
        endCrop();
        return;
    }

    isDrawingCrop = true;
    canvas.selection = false;
    canvas.on('mouse:down', onCropStart);
    canvas.on('mouse:move', onCropMove);
    canvas.on('mouse:up', onCropEnd);
}

function onCropStart(o) {
    const pointer = canvas.getPointer(o.e);
    cropRect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        fill: 'rgba(0,255,157,0.3)',
        strokeWidth: 2,
        stroke: '#00ff9d'
    });
    canvas.add(cropRect);
}

function onCropMove(o) {
    if (!cropRect) return;
    const pointer = canvas.getPointer(o.e);
    cropRect.set({
        width: pointer.x - cropRect.left,
        height: pointer.y - cropRect.top
    });
    canvas.renderAll();
}

function onCropEnd() {
    if (!cropRect) return;
    
    const img = canvas.getObjects()[0];
    if (!img) return;

    saveState();
    
    const cropped = new fabric.Image(img.getElement(), {
        left: img.left,
        top: img.top,
        clipPath: new fabric.Rect({
            left: cropRect.left - img.left,
            top: cropRect.top - img.top,
            width: cropRect.width,
            height: cropRect.height,
            absolutePositioned: true
        })
    });

    canvas.remove(img);
    canvas.remove(cropRect);
    canvas.add(cropped);
    canvas.renderAll();
    
    endCrop();
}

function endCrop() {
    isDrawingCrop = false;
    cropRect = null;
    canvas.selection = true;
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');
}

function circleCrop() {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    saveState();
    
    const minSize = Math.min(img.width * img.scaleX, img.height * img.scaleY);
    const circle = new fabric.Circle({
        radius: minSize / 2,
        left: img.left,
        top: img.top,
        absolutePositioned: true
    });

    img.clipPath = circle;
    canvas.renderAll();
}

function updateBrightness(e) {
    const value = parseFloat(e.target.value) / 100;
    applyAdjustment('brightness', value);
}

function updateContrast(e) {
    const value = parseFloat(e.target.value) / 100;
    applyAdjustment('contrast', value);
}

function applyAdjustment(type, value) {
    const img = canvas.getActiveObject() || canvas.getObjects()[0];
    if (!img) return;

    if (!img.filters) img.filters = [];
    
    img.filters = img.filters.filter(filter => 
        !(filter instanceof fabric.Image.filters[type.charAt(0).toUpperCase() + type.slice(1)])
    );

    img.filters.push(new fabric.Image.filters[type.charAt(0).toUpperCase() + type.slice(1)]({
        [type]: value
    }));

    img.applyFilters();
    canvas.renderAll();
}


function resizeCanvas() {
    const container = document.querySelector('.canvas-container');
    const containerWidth = container.clientWidth - 50;
    const containerHeight = container.clientHeight - 50;

    canvas.setDimensions({
        width: containerWidth,
        height: containerHeight
    });

    const objects = canvas.getObjects();
    if (objects.length > 0) {
        const img = objects[0];
        const scale = Math.min(
            containerWidth / img.width,
            containerHeight / img.height
        ) * 0.9;
        
        img.scale(scale);
        img.center();
    }

    canvas.renderAll();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

window.onload = function() {
    initCanvas();
    setupEventListeners();
};
