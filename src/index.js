require("dotenv").config({});
const fetch = require("node-fetch");
const { Editframe } = require("@editframe/editframe-js");
let options = {
  method: "GET",
  headers: { "X-FIGMA-TOKEN": process.env.FIGMA_TOKEN },
};
// Init new Editframe instance
const editframe = new Editframe({
  clientId: process.env.CLIENT_ID,
  token: process.env.TOKEN
});

const getImageDetails = async (imageRef, fileId) => {
  let url = `https://api.figma.com/v1/files/${fileId}/images`;
  // Get all images url inside of a figma file
  const res = await fetch(url, options);
  const json = await res.json();
  // return specifc image that we're looking for by reference
  return json.meta.images[imageRef];
};

const getFigmaData = async (fileId, nodeId) => {
  let url = `https://api.figma.com/v1/files/${fileId}/nodes?ids=${nodeId}`;

  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(url, options);
      const json = await res.json();
      const coordinates =
        json.nodes[Object.keys(json.nodes)[0]].document.absoluteBoundingBox;
      const bgColor =
        json.nodes[Object.keys(json.nodes)[0]].document.fills[0].color;

      // Create new video with duration of 3 seconds with frame width, height and bg color
      const composition = await editframe.videos.new({
        dimensions: {
          width: coordinates.width,
          height: coordinates.height,
        },
        duration: 3,
        backgroundColor: `rgb(${Math.round(bgColor.r * 256)},${Math.round(
          bgColor.g * 256
        )},${Math.round(bgColor.b * 256)})`,
      });
      for (const child of json.nodes[Object.keys(json.nodes)[0]].document
        .children) {
        if (child.type === "TEXT") {
          const text = child.characters;
          const rgb = child.fills[0].color;
          const textColor = `rgb(${Math.round(rgb.r * 256)},${Math.round(
            rgb.g * 256
          )},${Math.round(rgb.b * 256)})`;

          // Add new text layer to the video with data from Figma API
          await composition.addText(
            {
              color: textColor,
              fontFamily: child.style.fontFamily,
              fontSize: child.style.fontSize,
              fontWeight: child.style.fontWeight,
              text,
            },
            {
              position: {
                x: child.absoluteBoundingBox.x - coordinates.x,
                x: child.absoluteBoundingBox.y - coordinates.y,
              },
              trim: {
                end: 3,
              },
            }
          );
        } else if (child.type === "RECTANGLE") {
          // Image will be inside of parent node as fills array

          child.fills.forEach(async (fill) => {
            if (fill.type === "IMAGE") {
              // We retrieve image by ref using figma API
              const image = await getImageDetails(fill.imageRef, fileId);
              const { x, y, width, height } = child.absoluteBoundingBox;
              if (image) {
                // Add image layer to the video
                await composition.addImage(image, {
                  position: {
                    x: x - coordinates.x,
                    y: y - coordinates.y,
                  },
                  size: {
                    width,
                    height,
                  },
                  trim: {
                    end: 3,
                  },
                });
              }
            }
          });
        }
      }
      // Encode video synchronously, you can encode video async by listening to webhook events in your editframe application
      resolve(await composition.encodeSync());
    } catch (err) {
      console.error("error:" + err);
      reject(err);
    }
  });
};

module.exports = { getFigmaData };
