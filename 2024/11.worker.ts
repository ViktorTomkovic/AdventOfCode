self.onmessage = (e) => {
  const { stone, numberOfBlinks, messageNumber } = e.data;
  let stones = new Array<bigint>();
  stones.push(stone);
  for (let blink = 1; blink <= numberOfBlinks; blink++) {
    //console.log(stones);
    //console.log(blink, input.length, visited.size);
    const newStones = new Array<bigint>();
    for (const stone of stones) {
      const stoneString = stone.toString();
      if (stone == 0n) {
        newStones.push(1n);
      } else if ((stoneString.length & 1) == 0) {
        newStones.push(BigInt(stoneString.slice(0, stoneString.length >> 1)));
        newStones.push(BigInt(stoneString.slice(stoneString.length >> 1)));
      } else {
        newStones.push(stone * 2024n);
      }
    }
    stones = newStones;
  }
  postMessage({ stoneLength: BigInt(stones.length), messageNumber: messageNumber });
};
