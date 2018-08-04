const w = 500, h = 500, nodes = 5

class State {
    constructor() {
        this.scale = 0
        this.dir = 0
        this.prevScale = 0
    }

    update(cb) {
        this.scale += this.dir * 0.1
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class LRLNode {
    construtor(i) {
        this.i = i
        this.state = new State()
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new LRLNode(this.i + 1)
            this.next.prev = this
        }
    }

    update(cb) {
        this.state.update(() => {
            cb(i)
        })
    }

    startUpdating(cb) {
        this.state.startUpdating(cb)
    }

    getNext(dir , cb)  {
        var curr = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }

    draw(context) {
        const index = this.i % 2
        const factor = 1 - 2 * index
        const gap = w / nodes
        const size = (w/2) / (nodes * Math.cos(Math.PI/3))
        context.lineWidth = Math.min(w, h) / 60
        context.lineCap = 'round'
        context.strokeStyle = '#4CAF50'
        context.save()
        context.translate(w/2 + this.i * gap, h/2)
        context.rotate(2 * Math.PI/3 + factor * Math.PI * this.state.scale)
        context.beginPath()
        context.moveTo(0, 0)
        context.lineTo(size, 0)
        context.stroke()
        context.restore()
        if (this.next) {
            this.next.draw(context)
        }
    }
}

class LinkedLRL {
    constructor() {
        this.curr = new LRLNode(0)
        this.dir = 1
    }

    update(cb) {
        this.curr.update((i) => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb(i)
        })
    }

    startUpdating(cb) {
        this.curr.startUpdating(cb)
    }

    draw(context) {
        this.curr.draw(context)
    }
}

class Renderer {

    constructor() {
        this.running = true
        this.lrl = new LinkedLRL()
        this.lrl.startUpdating(() => {

        })
    }

    render(context, cb, endcb) {
        while(this.running) {
            context.fillStyle = '#212121'
            context.fillRect(0, 0, w, h)
            this.lrl.draw(context)
            cb(context)
            this.lrl.update((i) => {
                if (i != 0) {
                    this.lrl.startUpdating(() => {

                    })
                } else {
                    this.running = false
                    endcb()
                }

            })
        }
    }
}

const Canvas = require('canvas')
const GifEncoder = require('gifencoder')

class LRLGif {
    constructor(fn) {
        this.canvas = new Canvas(w, h)
        this.encoder = new GifEncoder(w, h)
        this.context = this.canvas.getContext('2d')
        this.renderer = new Renderer()
        this.initEncoder(fn)

    }

    initEncoder(fn) {
        this.encoder.setRepeat(0)
        this.encoder.setDelay(50)
        this.encoder.createReadStream().pipe(require('fs').createWriteStream(fn))
    }

    render() {
        this.encoder.start()
        this.renderer.render(this.context, (context) => {
            this.encoder.addFrame(context)
        }, () => {
            this.encoder.end()
        })
    }

    static create(fn) {
        const gif = new LRLGif(fn)
        gif.render()
    }

}
