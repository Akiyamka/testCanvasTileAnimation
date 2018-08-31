
document.addEventListener("DOMContentLoaded", startApp);
// http://jsfiddle.net/zw9S4/119/
function startApp() {
  const { hyper, wire } = hyperHTML;

  class Counter extends hyper.Component {
    constructor(tiles = []) {
      super();
      this.tiles = tiles;
      this.maxTiles = tiles.length - 1;
      this.canvas = wire()`<canvas id="canvas" width=256 height=256></canvas>`
      this.ctx = null;
      this.imagesStore = [];
      this.fadeFactor = 0; // incriment from 0 -> 100 at animation
      this.setState({
        currentTileIndex: 0,
      });
    }

    onconnected() {
      this.ctx = this.canvas.getContext("2d");
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
      return this.imagesStore[this.state.currentTileIndex].imgEl;
    }

    get futureImage() {
      const futureIndex = Number(this.state.currentTileIndex) + 1;
      return this.imagesStore[futureIndex > this.maxTiles ? 0 : futureIndex].imgEl;
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
        this.draw(this.imagesStore[0].imgEl);
      });

    }

    draw(img, opacity = 1) {
      this.ctx.save();
      this.ctx.globalAlpha = opacity;
      this.ctx.drawImage(img, 0, 0);
      this.ctx.restore();
    }

    animateFade() {
      const fromImage = this.currentImage;
      const toImage = this.futureImage;


      if (this.fadeFactor > 100) {
        this.setState(state => {
          const nextTile = Number(state.currentTileIndex) + 1;
          return {
            ...state,
            currentTileIndex: nextTile > this.maxTiles ? 0 : nextTile,
          }
        });
        this.fadeFactor = 0;
        return;
      }
      requestAnimationFrame(this.animateFade.bind(this));

      this.draw(toImage, this.fadeFactor / 100);
      this.draw(fromImage, (1 - this.fadeFactor / 100));
      this.fadeFactor++;
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
        this.animation = window.setInterval(this.animateFade.bind(this), 3000);
      }
    }

    render() {
      return this.html`
      <div class="view" onconnected=${this}>
        ${this.canvas}
      </div>

      <input type="range" name="timeline" id="timeline" min="0" max=${this.maxTiles} value=${this.state.currentTileIndex} onchange=${this} />
      <div>
        Frame: ${this.state.currentTileIndex}
      </div>
      <button style="margin: 18px; padding: 8px 12px" onclick="${this}"> ${this.state.isPaused ? 'Start' : 'Stop'}</button>`
    }
  }

  hyper(document.body)`${new Counter([
    'frames/1.png',
    'frames/2.png',
    'frames/3.png',
    'frames/4.png',
  ])}`;
}