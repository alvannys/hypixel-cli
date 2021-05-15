module.exports = (key) => {
    const hypixel = (new (require('hypixel-api-reborn')).Client(key, { cache: true }))
    return hypixel
}