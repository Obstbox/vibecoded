// Цветовая палитра ZX Spectrum
const spectrumColors = [
    [0, 0, 216],    // синий
    [216, 0, 0],    // красный
    [0, 216, 0],    // зеленый
    [216, 216, 0],  // желтый
    [0, 216, 216],  // голубой
    [216, 0, 216],  // пурпурный
    [216, 216, 216] // белый
];

// Цвета для фейерверков (более яркие)
const fireworkColors = [
    [255, 50, 50],  // ярко-красный
    [50, 255, 50],  // ярко-зеленый
    [50, 50, 255],  // ярко-синий
    [255, 255, 50], // ярко-желтый
    [255, 50, 255], // ярко-пурпурный
    [50, 255, 255]  // ярко-голубой
];

// Текст для анимации
const bdayText = "Happy B-Day, }{ELL!";
let chars = [];
let fontSize;
let startX;

// Массив для фейерверков
let fireworks = [];
let lastFireworkTime = 0;
const fireworkInterval = 1000; // миллисекунды между фейерверками

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight - 80);
    canvas.parent('p5-canvas');
    frameRate(30);
    textAlign(CENTER, CENTER);
    textFont('monospace');
    textStyle(BOLD);
    
    // Инициализация параметров текста
    fontSize = min(width / 12, height / 4);
    startX = width / 2 - (bdayText.length * fontSize * 0.6) / 2;
    
    // Создание объектов для каждого символа
    for (let i = 0; i < bdayText.length; i++) {
        chars.push({
            char: bdayText[i],
            x: startX + i * fontSize * 0.6,
            y: height / 2,
            color: spectrumColors[i % spectrumColors.length],
            phase: random(TWO_PI),
            speed: random(0.05, 0.1),
            amplitude: random(15, 30)
        });
    }
}

function draw() {
    background(0, 0, 0, 25); // Полупрозрачный фон для эффекта шлейфа
    textSize(fontSize);
    
    // Рисуем каждый символ с анимацией
    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        
        // Анимация по закону синуса
        const yOffset = sin(char.phase) * char.amplitude;
        char.phase += char.speed;
        
        // Установка цвета
        fill(char.color);
        noStroke();
        
        // Рисование символа
        text(char.char, char.x, char.y + yOffset);
    }
    
    // Добавляем эффект мерцания как в ZX Spectrum
    if (frameCount % 10 === 0) {
        for (let i = 0; i < 5; i++) {
            const idx = floor(random(chars.length));
            chars[idx].color = spectrumColors[floor(random(spectrumColors.length))];
        }
    }
    
    // Добавляем эффект статики на краях экрана
    drawStaticEffect();
    
    // Добавляем фейерверки по краям
    createFireworks();
    updateFireworks();
    drawFireworks();
}

// Создание фейерверков
function createFireworks() {
    const now = millis();
    if (now - lastFireworkTime > fireworkInterval) {
        lastFireworkTime = now;
        
        // Выбираем сторону запуска (0-3: верх, право, низ, лево)
        const side = floor(random(4));
        let x, y, targetX, targetY;
        
        // Начальная позиция на краю экрана
        switch(side) {
            case 0: // Верх
                x = random(width);
                y = 0;
                break;
            case 1: // Право
                x = width;
                y = random(height);
                break;
            case 2: // Низ
                x = random(width);
                y = height;
                break;
            case 3: // Лево
                x = 0;
                y = random(height);
                break;
        }
        
        // Цель в центральной области
        targetX = width/2 + random(-width/4, width/4);
        targetY = height/2 + random(-height/4, height/4);
        
        // Вектор движения
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = dist(x, y, targetX, targetY);
        const speed = random(3, 6);
        
        // Создаем новый фейерверк
        fireworks.push({
            x: x,
            y: y,
            targetX: targetX,
            targetY: targetY,
            vx: (dx / distance) * speed,
            vy: (dy / distance) * speed,
            particles: [],
            exploded: false,
            color: fireworkColors[floor(random(fireworkColors.length))],
            size: random(4, 8),
            life: 100
        });
    }
}

// Обновление состояния фейерверков
function updateFireworks() {
    for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];
        
        if (!fw.exploded) {
            // Движение к цели
            fw.x += fw.vx;
            fw.y += fw.vy;
            
            // Проверка достижения цели
            const d = dist(fw.x, fw.y, fw.targetX, fw.targetY);
            if (d < 10 || fw.life <= 0) {
                fw.exploded = true;
                createParticles(fw);
            }
            
            fw.life--;
        } else {
            // Обновление частиц
            for (let j = fw.particles.length - 1; j >= 0; j--) {
                const p = fw.particles[j];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.life -= p.fade;
                
                // Удаление частиц, которые "умерли"
                if (p.life <= 0) {
                    fw.particles.splice(j, 1);
                }
            }
            
            // Удаление фейерверка, если все частицы исчезли
            if (fw.particles.length === 0) {
                fireworks.splice(i, 1);
            }
        }
    }
}

// Создание частиц для фейерверка
function createParticles(fw) {
    const particleCount = floor(random(80, 150)); // Больше частиц
    
    for (let i = 0; i < particleCount; i++) {
        const angle = random(TWO_PI);
        const speed = random(1, 8);
        const size = random(2, 5);
        const life = random(50, 150);
        
        fw.particles.push({
            x: fw.x,
            y: fw.y,
            vx: cos(angle) * speed,
            vy: sin(angle) * speed,
            size: size,
            color: [
                fw.color[0] + random(-50, 50),
                fw.color[1] + random(-50, 50),
                fw.color[2] + random(-50, 50)
            ],
            gravity: 0.05,
            life: life,
            fade: random(1, 3)
        });
    }
}

// Отрисовка фейерверков
function drawFireworks() {
    noStroke();
    for (const fw of fireworks) {
        if (!fw.exploded) {
            // Рисуем летящую ракету
            fill(fw.color[0], fw.color[1], fw.color[2]);
            ellipse(fw.x, fw.y, fw.size, fw.size);
            
            // Огненный хвост
            for (let i = 0; i < 5; i++) {
                const alpha = map(i, 0, 5, 50, 200);
                fill(fw.color[0], fw.color[1], fw.color[2], alpha);
                ellipse(
                    fw.x - fw.vx * i * 0.5, 
                    fw.y - fw.vy * i * 0.5, 
                    fw.size * 0.8, 
                    fw.size * 0.8
                );
            }
        } else {
            // Рисуем частицы
            for (const p of fw.particles) {
                const alpha = map(p.life, 0, 100, 0, 255);
                fill(p.color[0], p.color[1], p.color[2], alpha);
                ellipse(p.x, p.y, p.size, p.size);
                
                // Эффект свечения
                if (random() > 0.7) {
                    fill(255, 255, 255, alpha * 0.3);
                    ellipse(p.x, p.y, p.size * 1.5, p.size * 1.5);
                }
            }
        }
    }
}

function drawStaticEffect() {
    // Рисуем случайные пиксели по краям экрана
    for (let i = 0; i < 50; i++) {
        const x = random(width);
        const y = random(height);
        
        // Только по краям
        if (x < 50 || x > width - 50 || y < 50 || y > height - 50) {
            const size = random(1, 3);
            const alpha = random(100, 200);
            fill(200, 200, 255, alpha);
            noStroke();
            rect(x, y, size, size);
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight - 80);
    fontSize = min(width / 12, height / 4);
    startX = width / 2 - (bdayText.length * fontSize * 0.6) / 2;
    
    // Обновление позиций символов
    for (let i = 0; i < chars.length; i++) {
        chars[i].x = startX + i * fontSize * 0.6;
        chars[i].y = height / 2;
    }
}
