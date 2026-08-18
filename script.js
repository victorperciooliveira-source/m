const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe'); 
const clouds = document.querySelector('.clouds'); 
const gameBoard = document.getElementById('gameBoard');
const restartButton = document.getElementById('restartButton');
const pontosDisplay = document.getElementById('pontos');
const faseDisplay = document.getElementById('fase');

// Sons
const jumpSound = new Audio('./mp3/maro-jump-sound-effect_1.mp3');
jumpSound.volume = 0.1; 
const gameOverSound = new Audio('./mp3/super-mario-death-sound-sound-effect.mp3');

const backgroundMusic = new Audio('./mp3/mario_bros.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

const faseSound = new Audio('./mp3/level-up.mp3');
const yeahooSound = new Audio('./mp3/yeahoo.mp3');

const yoshiSound = new Audio('./mp3/flower-garden-alert.mp3');
yoshiSound.loop = true; 
yoshiSound.volume = 0.5;

let pontos = 0;
let fase = 1;
let pontosAtivos = true;
let hitboxWidth = 120;
let gamePaused = false;
let scoreTimeoutId = null;

// Inicia música no clique/tecla
const iniciarMusica = () => {
    backgroundMusic.play().catch(() => {});
    document.removeEventListener('keydown', iniciarMusica);
    document.removeEventListener('click', iniciarMusica);
};
document.addEventListener('keydown', iniciarMusica);
document.addEventListener('click', iniciarMusica);

// Pulo
const jump = (event) => {
    if (event.type === 'keydown' && event.code !== 'Space' && event.code !== 'ArrowUp') return;
    if (!pontosAtivos || gamePaused) return;

    if (!mario.classList.contains('jump')) {
        mario.classList.add('jump');
        jumpSound.currentTime = 0;
        jumpSound.play().catch(() => {});
        setTimeout(() => mario.classList.remove('jump'), 500);
    }
};
document.addEventListener('keydown', jump);

// Clima dinâmico por fase
const atualizarClima = () => {
    gameBoard.classList.remove('day', 'night', 'rainy', 'cloudy');
    if (fase >= 4 && fase <= 6) {
        gameBoard.classList.add('rainy', 'cloudy');
    } else {
        const clima = fase % 3;
        if (clima === 1) gameBoard.classList.add('day');
        else if (clima === 2) gameBoard.classList.add('night');
        else gameBoard.classList.add('rainy');
    }
};

// Ajuste de velocidade do cano para 10 fases
const ajustarVelocidadeDoCano = () => {
    // Escala de 1.8s (fase 1) até 0.4s (fase 10)
    const novaDuracao = Math.max(0.4, 1.8 - (fase - 1) * 0.15);
    pipe.style.animation = 'none';
    pipe.style.right = '-80px';
    void pipe.offsetWidth; // Reflow
    pipe.style.animation = `pipe-animation ${novaDuracao}s infinite linear`;
};

// Atualização de pontos e fases
const atualizarPontuacao = () => { 
    if (!gamePaused && pontosAtivos) {
        pontos++;
        if (pontosDisplay) pontosDisplay.textContent = String(pontos);

        // A cada 100 pontos sobe de fase
        if (pontos % 100 === 0) {
            fase++;
            if (faseDisplay) faseDisplay.textContent = String(fase);

            // Condição de Vitória ao chegar na Fase 10
            if (fase === 10) {
                pontosAtivos = false;
                gamePaused = true;
                
                pipe.style.display = 'none';
                pipe.style.animationPlayState = 'paused';
                clouds.style.animationPlayState = 'paused';
                mario.style.animationPlayState = 'paused';
                
                backgroundMusic.pause();
                yoshiSound.pause();
                
                clearInterval(loop);
                clearTimeout(scoreTimeoutId);
                
                const finalScene = document.getElementById('finalScene');
                const finalVideo = document.getElementById('finalVideo');
                
                if (finalScene && finalVideo) {
                    finalScene.style.display = 'flex';
                    finalVideo.play().catch(() => {});
                    
                    if (finalVideo.requestFullscreen) {
                        finalVideo.requestFullscreen().catch(err => console.log('Fullscreen não disponível:', err));
                    }
                    
                    finalVideo.addEventListener('ended', () => {
                        window.location.href = 'start.html';
                    });
                }
                return;
            }

            // Mudar sprite do Mario conforme a fase
            if (fase === 2) {
                mario.src = './img/super-mario-world-yoshi.gif';
                mario.style.width = '150px';
                hitboxWidth = 150;
                
                backgroundMusic.volume = 0.1; 
                yoshiSound.currentTime = 0;
                yoshiSound.play().catch(() => {});
            } 
            else if (fase >= 3 && fase < 7) {
                mario.src = './img/super-mario-world-yoshi.gif'; 
                mario.style.width = '180px'; 
                hitboxWidth = 170;
                
                backgroundMusic.volume = 0.5;
                yoshiSound.pause(); 
            }
            else if (fase >= 7) {
                mario.src = './img/mario.gif';
                mario.style.width = '150px';
                hitboxWidth = 120;
                
                backgroundMusic.volume = 0.5;
                yoshiSound.pause(); 
            }

            setTimeout(atualizarClima, 300);
            ajustarVelocidadeDoCano();
            
            if (faseSound) {
                faseSound.currentTime = 0;
                faseSound.play().catch(() => {});
            }
            if (yeahooSound) {
                yeahooSound.currentTime = 0;
                yeahooSound.play().catch(() => {});
            }
        }
    }

    if (pontosAtivos && !gamePaused) {
        const novaVelocidade = Math.max(10, 80 - (fase - 1) * 7);
        scoreTimeoutId = setTimeout(atualizarPontuacao, novaVelocidade);
    }
};

atualizarPontuacao();

// Loop de Colisão
const loop = setInterval(() => {
    const pipePosition = pipe.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

    if (pipePosition <= hitboxWidth && pipePosition > 0 && marioPosition < 80) {
        pontosAtivos = false;
        gamePaused = true;
        clearTimeout(scoreTimeoutId);
        
        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;

        mario.style.animation = 'none';
        mario.style.bottom = `${marioPosition}px`;
        mario.src = './img/game-over.png';
        mario.style.width = '75px';
        mario.style.marginLeft = '50px';

        clearInterval(loop);
        
        backgroundMusic.pause();
        yoshiSound.pause();
        gameOverSound.play().catch(() => {});

        if (restartButton) restartButton.style.display = 'block';
    }
}, 10);

if (restartButton) {
    restartButton.addEventListener('click', () => window.location.href = 'start.html');
}