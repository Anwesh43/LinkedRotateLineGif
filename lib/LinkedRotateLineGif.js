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
        this.state.update(cb)
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
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb) {
        this.curr.startUpdating(cb)
    }

    draw(context) {
        this.curr.draw(context)
    }
}
