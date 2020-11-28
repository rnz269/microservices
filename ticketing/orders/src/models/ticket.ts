import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';

interface TicketAttrs {
  title: string;
  price: number;
}

interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

// now, let's build out our schema to describe an instance of an ticket
// that is, an ticket's different properties & rules about them
const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  // second argument: options obj of type mongoose.SchemaOptions
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// will give us the build method on the actual ticket model
ticketSchema.statics.build = function (attrs: TicketAttrs) {
  return new Ticket(attrs);
};

// will give us the isReserved method on each instance of a TicketDoc
// isReserved method checks whether a TicketDoc is currently reserved by a user
ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });
  return !!existingOrder;
};

// define our actual model
// 'Ticket' refers to the name of the collection
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket, TicketDoc };
