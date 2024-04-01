import { Response } from "express";

class ResponseHandler<T> {
  constructor(private res: Response, private data: T) {
    this.res = res;
    this.data = data;
  }

  public postResponse() {
    if (this.data === null)
      return this.res
        .status(500)
        .json({ err: "The post request was not succesfull" });

    return this.res.status(201).json({ msg: "Success", data: this.data });
  }

  public getResponse() {
    if (this.data === null)
      return this.res
        .status(404)
        .json({ err: `The following data id does not exist: ${this.data}` });

    return this.res.status(200).json({ msg: "Success", data: this.data });
  }

  public updateResponse() {
    if (this.data === null)
      return this.res
        .status(500)
        .json({ err: "An error occured during the update process..." });

    return this.res.status(200).json({ msg: "Success", data: this.data });
  }

  public deleteResponse() {
    if (this.data === null)
      return this.res
        .status(500)
        .json({ err: "An error occured during the deletion process..." });

    return this.res.status(200).json({ msg: "Success", data: this.data });
  }
}

export default ResponseHandler;
