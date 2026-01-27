import { Document, Model, Schema, model, Types } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  description?: string;
  members: Types.ObjectId[];
  createdBy: Types.ObjectId;
}

const roomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ name: 1 }, { unique: true });

roomSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Room: Model<IRoom> = model<IRoom>('Room', roomSchema);

export default Room;
