//criando funções
function novoElemento(tagName, className){
    const elemento = document.createElement(tagName)
    elemento.className = className
    return elemento
}

//cria barreiras
function Barreira(inferior = false){
    this.elemento = novoElemento('div','barreira')
    const corpo = novoElemento('div','corpo')
    const borda = novoElemento('div','borda')
    if(inferior){
        this.elemento.appendChild(borda)
        this.elemento.appendChild(corpo)        
    }else{
        this.elemento.appendChild(corpo)
        this.elemento.appendChild(borda)
    }

    this.setAltura = (altura) => corpo.style.height = altura+'px'
}

//cria par de barreiras
function ParBarreira(alturaGame, aberturaBarreiras, eixoX){
    this.elemento = novoElemento('div', 'barreiras')
    this.superior = new Barreira()
    this.inferior = new Barreira(true)
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.setX = (x) => this.elemento.style.left = x+'px'
    this.getX = () => {
        px = this.elemento.style.left
        x = px.split('px') //exclui os caracteres px da string
        return (parseInt(x)) //retorna x num valor inteiro
    }
    this.getWidth = () => this.elemento.clientWidth
    
    this.sortearAbertura = () => {
        const alturaSuperior = parseInt(
            Math.random() * (alturaGame - aberturaBarreiras) //sorteia de forma aleatoria um valor para multiplicar com com a diferença entre as barreiras
        )
        const alturaInferior = alturaGame - alturaSuperior - aberturaBarreiras
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.setX(eixoX)
    
    this.sortearAbertura()   
}

function GestorBarreiras(alturaGame, larguraGame, aberturaBarreira, distanciaBarreira, deslocamento, pontos){
    const nBarreiras = Math.round(larguraGame, distanciaBarreira)+1 //arredonda o valor total de barreiras q cabe na área útil do jogo e soma 1
    this.barreiras = []
    for(cont = 0; cont < nBarreiras; cont++){
        eixoX = larguraGame + distanciaBarreira * cont
        this.barreiras.push(new ParBarreira(alturaGame, aberturaBarreira, eixoX))
    }
    const meio = larguraGame/2

    this.animar = () =>{
        this.barreiras.forEach((bar, indice) => {
            bar.setX(bar.getX()-deslocamento)

            if(bar.getX()+bar.getX()<0){
                let posicao = (indice>0?indice:this.barreiras.length)
                bar.setX(this.barreiras[posicao-1].getX()+distanciaBarreira)
                bar.sortearAbertura()
            }

            if (bar.getX() < meio && bar.getX()+ deslocamento >= meio){
                pontos()
            }

            
        })
    }
}

function Passaro(alturaGame){
    this.elemento = novoElemento('img','passaro')
    this.elemento.src = 'assets/images/passaro.png'

    this.getY = () => {
        px = this.elemento.style.bottom
        y = px.split('px')
        return(parseInt(y))
    }

    this.setY = (y) => this.elemento.style.bottom = y+'px'
    this.setY(alturaGame/2)

    let voando = false
    window.onkeydown =(e) => voando = true
    window.onkeyup = (e) => voando = false
    const alturaMaxima = alturaGame - this.elemento.clientHeight
    this.animar = () => {
        let novoY = this.getY() + (voando ? 5:-5)
        if(novoY<0){
            novoY = 0
        }else if (novoY > alturaMaxima){
            novoY = alturaMaxima
        }
        this.setY(novoY)
    }
}

function Pontuacao(){
    this.elemento = novoElemento('span', 'pontos')
    this.atualizarPontos = (pontos) => this.elemento.innerHTML = pontos
    this.atualizarPontos(0)
}

function colisao(elemento1, elemento2) {
    const a = elemento1.getBoundingClientRect()
    const b = elemento2.getBoundingClientRect()

    const colisaoX = a.left + a.width > b.left && b.left + b.width >= a.left
    const colisaoY = a.top + a.height > b.top && b.top + b.height >= a.left

    return colisaoX && colisaoY
}

function checkColisao(passaro, gestorBarreiras){
    let colidiu = false
    gestorBarreiras.barreiras.forEach((barreira) => {
        const superior = barreira.superior.elemento
        const inferior = barreira.inferior.elemento
        if(colisao(passaro.elemento, superior) || colisao(passaro.elemento, inferior)){
            colidiu = true
            console.log("Você Perdeu!")
        }
    })
    return colidiu
}


function FlappyBird(){
    const game = document.querySelector('.game')
    const altura = game.clientHeight
    const largura = game.clientWidth
    let pontos = 0
    const passaro = new Passaro(altura)
    const pontuacao = new Pontuacao()
    const gestorBarreiras = new GestorBarreiras(altura, largura, 200, 400, 4, () => pontuacao.atualizarPontos(++pontos))

    
    game.appendChild(pontuacao.elemento)
    gestorBarreiras.barreiras.forEach(barreira => {
        game.appendChild(barreira.elemento)
    })

    game.appendChild(passaro.elemento)
    this.start = () =>{
        const temporizador = setInterval(() =>{
            gestorBarreiras.animar()
            passaro.animar()
            if(checkColisao(passaro, gestorBarreiras)){
                clearInterval(temporizador)
                if(confirm("Você perdeu! A pontuação final foi de "+pontos+" Quer jogar novamente?")){
                    document.location.reload()
                }
            }
        }, 2)
    }
}

new FlappyBird().start()

