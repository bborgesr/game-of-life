(function() {
  var _ = (self.Life = function(seed) {
    this.seed = seed;
    this.height = seed.length;
    this.width = seed[0].length;

    this.prevBoard = [];
    this.board = cloneArray(seed);
  });

  _.prototype = {
    next: function() {
      this.prevBoard = cloneArray(this.board);

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          let neighbors = this.aliveNeighbors(this.prevBoard, x, y);

          let alive = !!this.board[y][x];
          if (alive) {
            if (neighbors < 2 || neighbors > 3) {
              this.board[y][x] = 0;
            }
          } else {
            if (neighbors === 3) {
              this.board[y][x] = 1;
            }
          }
        }
      }
    },

    aliveNeighbors: function(array, x, y) {
      const prevRow = array[y - 1] || [];
      const nextRow = array[y + 1] || [];

      return [
        prevRow[x - 1],
        prevRow[x],
        prevRow[x + 1],
        array[y][x - 1],
        array[y][x + 1],
        nextRow[x - 1],
        nextRow[x],
        nextRow[x + 1]
      ].reduce((prev, cur) => (prev += !!cur), 0);
    },

    toString: function() {
      return this.board.map(row => row.join(" ")).join("\n");
    }
  };

  // helpers
  function cloneArray(array) {
    return array.slice().map(row => row.slice());
  }
})();

// demo
// var game = new Life([
//   [0, 0, 0, 0, 0],
//   [0, 0, 1, 0, 0],
//   [0, 0, 1, 0, 0],
//   [0, 0, 1, 0, 0],
//   [0, 0, 0, 0, 0]
// ]);

// console.log(game + "");
// game.next();
// console.log(game + "");
// game.next();
// console.log(game + "");

class LifeView {
  constructor(table, size) {
    this.grid = table;
    this.size = size;
    this.started = false;
    this.autoplay = false;

    this.createGrid();
  }

  createGrid(grid) {
    let me = this;

    let fragment = document.createDocumentFragment();
    this.grid.innerHTML = "";
    this.checkboxes = [];

    for (let y = 0; y < this.size; y++) {
      const row = document.createElement("tr");
      this.checkboxes[y] = [];

      for (let x = 0; x < this.size; x++) {
        const cell = document.createElement("td");
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        this.checkboxes[y][x] = checkbox;

        cell.appendChild(checkbox);
        row.appendChild(cell);
      }

      fragment.appendChild(row);
    }

    this.grid.addEventListener("change", function(evt) {
      if (evt.target.nodeName.toLowerCase() === "input") {
        me.started = false;
      }
    });

    this.grid.appendChild(fragment);
  }

  get boardArray() {
    return this.checkboxes.map(row => {
      return row.map(checkbox => +checkbox.checked);
    });
  }

  play() {
    this.game = new Life(this.boardArray);
    this.started = true;
  }

  next() {
    let me = this;
    if (!this.started || this.game) {
      this.play();
    }
    this.game.next();
    let board = this.game.board;

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        this.checkboxes[y][x].checked = !!board[y][x];
      }
    }

    if (this.autoplay) {
      this.timer = setTimeout(function() {
        me.next();
      }, 1000);
    }
  }
}

let lifeView = new LifeView(document.getElementById("grid"), 12);

// *********************************************************************

function $(selector, container) {
  return (container || document).querySelector(selector);
}

(function() {
  let buttons = {
    next: $("button.next")
  };

  buttons.next.addEventListener("click", function() {
    lifeView.next();
  });

  $("#autoplay").addEventListener("change", function() {
    buttons.next.textContent = this.checked ? "Start" : "Next";

    lifeView.autoplay = this.checked;

    if (!this.checked) {
      clearTimeout(lifeView.timer);
    }
  });
})();
