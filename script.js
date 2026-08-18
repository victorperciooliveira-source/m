// Velocidade do cano balanceada (2.0s no Nível 1 até ~0.9s no Nível 10)
const ajustarVelocidadeDoCano = () => {
    const novaDuracao = Math.max(0.9, 2.0 - (fase - 1) * 0.12);
    pipe.style.animation = 'none';
    pipe.style.right = '-80px';
    void pipe.offsetWidth; // Força o reflow para reiniciar a animação
    pipe.style.animation = `pipe-animation ${novaDuracao}s infinite linear`;
};

// Ritmo de pontuação constante e suave (1 ponto a cada 120ms = ~12 segundos por fase)
const atualizarPontuacao = () => { 
    if (!gamePaused && pontosAtivos) {
        pontos++;
        if (pontosDisplay) pontosDisplay.textContent = String(pontos);

        if (pontos % 100 === 0) {
            fase++;
            if (faseDisplay) faseDisplay.textContent = String(fase);

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

            // Mudanças de sprite por fase
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
        // Mantém 120ms para a pontuação subir de forma fluida sem acelerar demais o jogo
        scoreTimeoutId = setTimeout(atualizarPontuacao, 120);
    }
};