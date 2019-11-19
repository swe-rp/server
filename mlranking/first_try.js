// import * as tf from "@tensorflow/tfjs";
// import "@tensorflow/tfjs-node";
// import trainingData from "./trainingData.json";

// const numberOfTags = 3;

// function getPredictions(eventList, userTag) {
//   let mappedData = mapData();
//   const model = buildModel();
// }

// //mapData
// function mapData() {}

// function buildModel() {
//   const model = tf.sequential();

//   model.add(
//     tf.layers.dense({
//       inputShape: [2 * numberOfTags],
//       activation: "sigmoid",
//       units: 5
//     })
//   );

//   model.add(
//     tf.layers.dense({
//       inputShape: [5],
//       activation: "sigmoid",
//       units: 3
//     })
//   );

//   model.add(
//     tf.layers.dense({
//       inputShape: [3],
//       activation: "sigmoid",
//       units: 1
//     })
//   );

//   model.compile({
//     loss: "meanSquaredError",
//     optimizer: tf.train.adam(0.06)
//   });

//   return model;
// }

// // convert/setup our data
// // const trainingData = tf.tensor2d(iris.map(item => [
// //   item.sepal_length, item.sepal_width, item.petal_length, item.petal_width,
// // ]))
// // const outputData = tf.tensor2d(iris.map(item => [
// //   item.species === "setosa" ? 1 : 0,
// //   item.species === "virginica" ? 1 : 0,
// //   item.species === "versicolor" ? 1 : 0,
// // ]))

// // train/fit our network
// const startTime = Date.now();
// model.fit(trainingData, outputData, { epochs: 100 }).then((history) => {
//   // console.log(history)
//   model.predict(testingData).print();
// });
