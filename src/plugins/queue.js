class Queue {
    constructor () {
        this.queue = []
    }

    enqueue (item) {
        this.queue.push(item)
    }

    dequeue () {
        return this.queue.shift()
    }

    front () {
        return this.queue[0]
    }

    size () {
        return this.queue.length
    }

    clear () {
        this.queue = []
    }
}

export default Queue
