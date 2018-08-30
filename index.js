
document.addEventListener("DOMContentLoaded", startApp);

function startApp() {
  const { hyper } = hyperHTML;

  class Counter extends hyper.Component {
    constructor(tiles = []) {
      super();
      this.sequence = [];
      this.lockRender = false;
      this.tiles = tiles;
      this.maxTiles = tiles.length - 1
      this.setState({
        currentTileIndex: 0,
      });
      this.interval = window.setInterval(() => this.renderFrame(), 30)
    }

    get defaultState() {
      return {
        currentTileIndex: 0,
        isPaused: true,
        mixedTile: this.tiles[0],
      };
    }

    get currentTile() {
      return this.tiles[this.state.currentTileIndex];
    }

    get futureTile() {
      const futureIndex = Number(this.state.currentTileIndex) + 1;
      return this.tiles[futureIndex > this.maxTiles ? 0 : futureIndex];
    }

    // Create task for merge two images and return promise
    getRenderTask(nextTileOpacity) {
      const currentTile = this.currentTile;
      const futureTile = this.futureTile;

      return mergeImages([
        { src: currentTile, opacity: 1 },
        { src: futureTile, opacity: nextTileOpacity },
      ]);
    }

    addFadeInAnimationToSequence() {
      const iterations = 30;

      let n = 0;
      while(n < 1) {
        n += 1 / iterations;
        const task = this.getRenderTask(n);
        this.sequence.push(task);
      }
    }

    renderFrame() {
      if (this.lockRender || this.sequence.length == 0) return;
      this.lockRender = true;
      const renderTask = this.sequence.shift();

      renderTask.then(newImage => {

        this.setState(state => ({
            ...state,
            mixedTile: newImage
          })
        );

        this.lockRender = false;
      });
    }

    showNextTile() {
      this.addFadeInAnimationToSequence();
      // Maybe we must wait until animation ended ?
      this.setState(state => {
        const nextTile = Number(state.currentTileIndex) + 1;
        return {
          ...state,
          currentTileIndex: nextTile > this.maxTiles ? 0 : nextTile,
        }
      });
    }

    onchange(event) {
      this.setState(state => {
        return {
          currentTileIndex: event.target.value,
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
        this.animation = window.setInterval(this.showNextTile.bind(this), 2000);
      }
    }


    render() {
      // <img class="prevFrame anim-out" src=${this.previosFrame} title="prevFrame"/>
      return this.html`
      <div class="view">
        <img src=${this.state.mixedTile}/>
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