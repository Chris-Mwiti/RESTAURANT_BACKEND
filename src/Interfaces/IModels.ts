import { Resturants, User } from "@prisma/client";

interface INewProductInfoObj {
  // Product Details
  productName: string;
  productDescription: string;
  buyingPrice: string;
  isPerishable: boolean;
  lowLevelAlert: number;
  sellingPrice: string;
  productImages: string[];
  productQuantity: string;
  category: {
    id: string;
  };
  inventory: {
    quantity: string;
  };

  //Discount Details
  discountId?: string;

  // Category Details
  categoryName?: string;
  categoryDescription?: string;


  //Inventory Details
  inventoryQty: number;

  //Asset Details
  imageUrl: string[];
  type?: Resturants
}

interface IUser extends User {}

type UserRecord = Omit<IUser, "createdAt" | "updatedAt">;
type UserRecordWithoutId = Omit<UserRecord, "id">;

interface IUserLoginCredentials {
    email:string;
    password:string;
}

export {
    INewProductInfoObj,
    UserRecord,
    UserRecordWithoutId,
    IUserLoginCredentials
}