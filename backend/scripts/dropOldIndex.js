// Script to drop old index that's causing duplicate key errors
// Run this once: node scripts/dropOldIndex.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropOldIndex = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('bookings');

    // List all indexes
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:', indexes);

    // Drop old index if it exists (user_1_shipment_1)
    try {
      await collection.dropIndex('user_1_shipment_1');
      console.log('✅ Dropped old index: user_1_shipment_1');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️  Index user_1_shipment_1 does not exist (already removed)');
      } else {
        console.error('❌ Error dropping index:', err.message);
      }
    }

    // Drop any other old indexes with 'user' or 'shipment' in the name
    for (const index of indexes) {
      const indexName = index.name;
      // Drop old indexes that shouldn't be unique
      if ((indexName.includes('user') && indexName.includes('shipment')) || 
          indexName === 'shipment_1' || 
          indexName === 'user_1') {
        // Skip the new correct indexes
        if (indexName === 'userId_1_shipmentId_1' || 
            indexName === 'unique_active_booking_per_shipment' ||
            indexName === 'status_1') {
          continue;
        }
        try {
          await collection.dropIndex(indexName);
          console.log(`✅ Dropped old index: ${indexName}`);
        } catch (err) {
          if (err.code === 27) {
            console.log(`ℹ️  Index ${indexName} does not exist (already removed)`);
          } else {
            console.error(`❌ Error dropping ${indexName}:`, err.message);
          }
        }
      }
    }

    // Drop the unique constraint on userId_1_shipmentId_1 if it exists (users should be able to book multiple shipments)
    try {
      const userIdShipmentIndex = indexes.find(idx => idx.name === 'userId_1_shipmentId_1');
      if (userIdShipmentIndex && userIdShipmentIndex.unique) {
        await collection.dropIndex('userId_1_shipmentId_1');
        console.log('✅ Dropped unique constraint on userId_1_shipmentId_1');
        // Recreate it without unique constraint
        await collection.createIndex({ userId: 1, shipmentId: 1 }, { unique: false, name: 'userId_1_shipmentId_1' });
        console.log('✅ Recreated userId_1_shipmentId_1 index without unique constraint');
      }
    } catch (err) {
      if (err.code !== 27) {
        console.error('❌ Error handling userId_1_shipmentId_1 index:', err.message);
      }
    }

    // Drop shipment_1 unique index if it exists (should only have partial unique on active bookings)
    try {
      const shipmentIndex = indexes.find(idx => idx.name === 'shipment_1');
      if (shipmentIndex && shipmentIndex.unique && shipmentIndex.name !== 'unique_active_booking_per_shipment') {
        await collection.dropIndex('shipment_1');
        console.log('✅ Dropped unique constraint on shipment_1');
      }
    } catch (err) {
      if (err.code !== 27) {
        console.error('❌ Error handling shipment_1 index:', err.message);
      }
    }

    console.log('✅ Done! You can now restart your server.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

dropOldIndex();

