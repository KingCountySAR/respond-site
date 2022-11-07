import express from "express";

export default class Server {
  async boot() {
    const app = express();
    app.use(express.static("public"));
    app.get('/api/test',(req, res)=>{
      res.json({"message":"Hello World!!"});
    });

    const port = process.env.PORT || 3333;
    console.log('Starting server listening to port ' + port);
    app.listen(port);
  }
}
