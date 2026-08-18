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
let gamePaused = false;
let scoreTimeoutId = null;

// Ativar áudio no primeiro clique ou tecla
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

// Clima por fase
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

// Velocidade do cano
const ajustarVelocidadeDoCano = () => {
    const novaDuracao = Math.max(0.9, 2.0 - (fase - 1) * 0.12);
    pipe.style.animation = 'none';
    void pipe.offsetWidth; // Força reflow para reiniciar animação CSS
    pipe.style.animation = `pipe-animation ${novaDuracao}s infinite linear`;
};

// Lógica de pontuação e transição de fase
const atualizarPontuacao = () => { 
    if (!gamePaused && pontosAtivos) {
        pontos++;
        if (pontosDisplay) pontosDisplay.textContent = String(pontos);

        if (pontos % 100 === 0) {
            fase++;
            if (faseDisplay) faseDisplay.textContent = String(fase);

            // Vitória ao atingir a Fase 10
            if (fase === 10) {
                pontosAtivos = false;
                gamePaused = true;
                clearTimeout(scoreTimeoutId);
                clearInterval(loop);
                
                pipe.style.display = 'none';
                clouds.style.animationPlayState = 'paused';
                mario.style.animationPlayState = 'paused';
                
                backgroundMusic.pause();
                yoshiSound.pause();
                
                const finalScene = document.getElementById('finalScene');
                const finalVideo = document.getElementById('finalVideo');
                
                if (finalScene && finalVideo) {
                    finalScene.style.display = 'flex';
                    finalVideo.play().catch(() => {});
                    
                    if (finalVideo.requestFullscreen) {
                        finalVideo.requestFullscreen().catch(() => {});
                    }
                    
                    finalVideo.addEventListener('ended', () => {
                        window.location.reload();
                    });
                }
                return;
            }

            // Mudar sprite conforme a fase
            if (fase === 2) {
                mario.src = './img/super-mario-world-yoshi.gif';
                mario.style.width = '150px';
                backgroundMusic.volume = 0.1; 
                yoshiSound.currentTime = 0;
                yoshiSound.play().catch(() => {});
            } 
            else if (fase >= 3 && fase < 7) {
                mario.src = './img/super-mario-world-yoshi.gif'; 
                mario.style.width = '180px'; 
                backgroundMusic.volume = 0.5;
                yoshiSound.pause(); 
            }
            else if (fase >= 7) {
                mario.src = './img/mario.gif';
                mario.style.width = '150px';
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
        scoreTimeoutId = setTimeout(atualizarPontuacao, 120);
    }
};

// Iniciar a pontuação
atualizarPontuacao();

// Loop de detecção de colisão usando o retângulo real dos elementos
const loop = setInterval(() => {
    const pipePosition = pipe.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
    const marioRect = mario.getBoundingClientRect();
    const pipeRect = pipe.getBoundingClientRect();

    const overlapX = marioRect.right > pipeRect.left + 12 && marioRect.left < pipeRect.right - 12;
    const overlapY = marioRect.bottom > pipeRect.top + 12 && marioRect.top < pipeRect.bottom - 12;

    if (overlapX && overlapY) {
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

// Botão reiniciar
if (restartButton) {
    restartButton.addEventListener('click', () => window.location.reload());
}