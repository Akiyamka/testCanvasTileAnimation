
document.addEventListener("DOMContentLoaded", startApp);
// http://jsfiddle.net/zw9S4/119/
function startApp() {
  const { hyper, wire } = hyperHTML;

  class Counter extends hyper.Component {
    constructor(tiles = []) {
      super();
      this.tiles = tiles;
      this.maxTiles = tiles.length - 1;
      this.topImageLayer = wire()`<img src="./frames/1.png" alt=""/ style="position: absolute">`;
      this.bottomImageLayer = wire()`<img src="./frames/2.png" alt=""/>`
      this.fadeFactor = 0; // incriment from 0 -> 100 at animation
      this.imagesStore = []
      this.setState({
        currentTileIndex: 0,
      });
    }

    onconnected() {
      this.loadAllImages().then(() => {
        console.log('images loaded', this.imagesStore)
      })
    }

    get defaultState() {
      return {
        currentTileIndex: 0,
        isPaused: true,
      };
    }

    get currentImage() {
      return this.imagesStore[this.state.currentTileIndex].src;
    }

    get futureImage() {
      const futureIndex = Number(this.state.currentTileIndex) + 1;
      return this.imagesStore[futureIndex > this.maxTiles ? 0 : futureIndex].src;
    }

    loadImage(url) {
      return new Promise((resolve, reject) => {
        const newImage = new Image();

        newImage.onload = () => {
          resolve({
            src: url,
            imgEl: newImage,
          })
        }

        newImage.onerror = error => {
          reject({
            src: url,
            error,
          })
        }

        newImage.crossOrigin = 'anonymous';
        newImage.src = url;
      })
    }

    loadAllImages() {
      const loadQueue = [];
      this.tiles.forEach(imageURL => {
        loadQueue.push(this.loadImage(imageURL));
      });

      return Promise.all(loadQueue).then(images => {
        this.imagesStore = images || [];
      });

    }

    draw(img, animationName) {
      img.classList.remove(animationName);
      void img.offsetWidth;
      img.classList.add(animationName);
    }

    animateFade() {
      this.topImageLayer.src = this.currentImage;
      this.bottomImageLayer.src = this.futureImage;
      console.log('TCL: Counter -> animateFade -> topImageLayer.src', this.topImageLayer.src);
      this.draw(this.bottomImageLayer, 'anim-in')
      setTimeout(this.draw.bind(this, this.topImageLayer, 'anim-out'), 3000)
      // this.draw(this.topImageLayer, 'anim-out')
      this.setState(state => {
        const newIndex = state.currentTileIndex + 1;
        return {
          ...state,
          currentTileIndex: newIndex > this.maxTiles ? 0 : newIndex
        }
      });
    }

    onchange(event) {
      this.animateFade()
      this.setState(state => {
        const newIndex = event.target.value - 1
        return {
          currentTileIndex: newIndex < 0 ? this.maxTiles : newIndex,
          isPaused: true,
        }
      });
    }

    onclick() {
      this.setState(state => {
        return {
          ...state,
          isPaused: !state.isPaused
        }
      });

      if (this.state.isPaused) {
        window.clearInterval(this.animation);
      } else {
        this.animation = window.setInterval(this.animateFade.bind(this), 6000);
      }
    }

    render() {
      return this.html`
        <hr>
        <div class="view" onconnected=${this}>
          ${this.topImageLayer}
          ${this.bottomImageLayer}
        </div>
        <input type="range" name="timeline" id="timeline" min="0" max=${this.maxTiles} value=${this.state.currentTileIndex} onchange=${this} />
        <div>
          Frame: ${this.state.currentTileIndex}
        </div>
        <button style="margin: 18px; padding: 8px 12px" onclick="${this}"> ${this.state.isPaused ? 'Start' : 'Stop'}</button>`
    }
  }

  hyper(document.querySelector('#app2'))`${new Counter([
    'frames/1.png',
    'frames/2.png',
    'frames/3.png',
    'frames/4.png',
  ])}`;
}