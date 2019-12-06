import { NowRequest, NowResponse } from '@now/node';
import util from "util";
import formidable from "formidable";

export default async (req: NowRequest, res: NowResponse) => {
  res.setHeader("cache-control", "s-maxage=0 maxage=0");
   let form = new formidable.IncomingForm();
   var formfields = await new Promise<any>(function(resolve, reject) {
      form.parse(req, function(err, fields, files) {
      if (err) {
         reject(err);
         return;
      }
      resolve({ fields: fields, files: files });
   });
});

console.log("Post fields body: " + util.inspect(formfields.fields));
console.log("Post files body: " + util.inspect(formfields.files));
return res
  .status(200)
  .json({ message: "Done" });
};
