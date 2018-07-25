import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Purchase } from './interfaces/purchase.interface';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class PurchaseService {
    constructor( 
        @InjectModel('Purchase') private readonly PurchaseModel: Model<Purchase>,
        private readonly productsService: ProductsService,
    ) {}

    async create(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
        const productId = String(createPurchaseDto.productId)
        const productInfo = await this.productsService.findOne(productId);
        const newPurchase = {
            userId: createPurchaseDto.userId,
            productId: createPurchaseDto.productId,
            productName: createPurchaseDto.productName,
            pricePaid: productInfo.price,
            created: createPurchaseDto.created,
            modified: createPurchaseDto.modified
        }
        const createdPurchase = new this.PurchaseModel(newPurchase);
        return await createdPurchase.save();
    }

    async findAllDetails(user): Promise<Purchase[]> {
        return await this.PurchaseModel
        .aggregate()
        .match({ userId: user.id })
        .group({ _id: '$productName', pricePaid: { $sum: 1 }, total: { $sum: '$pricePaid' }, created: { $max: '$created' } })
        .project({ _id: 0, Product: '$_id', lasPurchase: '$created', items: '$pricePaid', total: '$total' })
        .exec();
    }

    async findAll(user): Promise<Purchase[]> {
        return await this.PurchaseModel
        .aggregate()
        .match({ userId: user.id })
        .group({ _id: '$userId', totalOwed: { $sum: '$pricePaid' } })
        .exec();
    }
}