const {
  Product,
  Bid,
  ProductSize,
  Size,
  Order,
  OrderStatus,
  sequelize
} = require('../models');

// const linenotify = require('../service/linenoti-service');

//get price for buy at buyer selected size

exports.getPriceBySize = async (req, res, next) => {
  try {
    const getProductSize = await ProductSize.findOne({
      where: { sizeId: req.params.sizeId, productId: req.params.productId }
    });

    const getMinPriceAsk = await Bid.findAll({
      where: {
        productSizeId: getProductSize.id,
        type: 'SELLER',
        isSold: false,
        expiredDate: 'NONE'
      },
      include: [
        {
          model: ProductSize,
          include: [{ model: Product }, { model: Size }]
        }
      ]
    });

    const allPriceBysize = getMinPriceAsk
      .map((el) => {
        return {
          bidId: el.id,
          minPrice: el.price,
          product: el.ProductSize.Product.ProductImage,
          size: el.ProductSize.Size.sizeProduct
        };
      })
      .flat();
    // const minAskPrice = Math.min(...allPriceBysize.map((i) => i.minPrice));
    allPriceBysize.sort((a, b) => a.minPrice - b.minPrice);

    res.status(200).json(allPriceBysize[0]);
  } catch (err) {
    next(err);
  }
};

exports.getPriceMaxBySize = async (req, res, next) => {
  try {
    const getProductSize = await ProductSize.findOne({
      where: { sizeId: req.params.sizeId, productId: req.params.productId }
    });

    const getMaxPriceBid = await Bid.findAll({
      where: {
        productSizeId: getProductSize.id,
        type: 'BUYER',
        isSold: false,
        expiredDate: 'NONE'
      },
      include: [
        {
          model: ProductSize,
          include: [{ model: Product }, { model: Size }]
        }
      ]
    });
    const allPriceBysize = getMaxPriceBid
      .map((el) => {
        return {
          bidId: el.id,
          maxPrice: el.price,
          product: el.ProductSize.Product.ProductImage,
          size: el.ProductSize.Size.sizeProduct
        };
      })
      .flat();
    allPriceBysize.sort((a, b) => b.maxPrice - a.maxPrice);

    res.status(200).json(allPriceBysize[0]);
  } catch (err) {
    next(err);
  }
};

exports.postBid = async (req, res, next) => {
  try {
    const getProductSizeId = await ProductSize.findOne({
      where: {
        sizeId: req.body.sizeId,
        productId: req.body.productId
      }
    });

    const createBid = await Bid.create({
      price: req.body.price,
      type: req.body.type,
      userId: req.user.id,
      productSizeId: getProductSizeId.id,
      equipment: req.body.equipment
    });

    // linenotify(req.userId, 'คุณได้ทำการสั่งซื้อเรียบร้อยแล้ว');
    // console.log(getProductSizeId);
    res.status(201).json({ createBid });
  } catch (err) {
    next(err);
  }
};

// exports.getAllBids = async (req, res, next) => {
//   try {
//     const getBids = await Bid.findAll({
//       where: {
//         userId: req.user.id,
//         isSold: false
//       },
//       include: [
//         {
//           model: ProductSize,
//           include: [{ model: Product }, { model: Size }]
//         }
//       ]
//     });
//     res.status(200).json({ getBids });
//   } catch (err) {
//     next(err);
//   }
// };

exports.getAllBids = async (req, res, next) => {
  try {
    const getBids = await Bid.findAll({
      where: {
        userId: req.user.id
      },
      include: [
        {
          model: ProductSize,
          include: [{ model: Product }, { model: Size }]
        },
        {
          model: Order,
          include: { model: OrderStatus }
        }
      ]
    });
    res.status(200).json({ getBids });
  } catch (err) {
    next(err);
  }
};

exports.deleteBid = async (req, res, next) => {
  try {
    const cancelBid = await Bid.findOne({
      where: {
        userId: req.user.id,
        id: req.body.id
      }
    });
    await cancelBid.update({
      expiredDate: 'CANCEL'
    });
    res.status(204).json({ cancelBid });
  } catch (err) {
    next(err);
  }
};
