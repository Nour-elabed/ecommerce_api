import dotenv from 'dotenv'
dotenv.config()

process.stdout.write('SEED START\n')

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

process.on('uncaughtException', (e) => {
    process.stdout.write('UNCAUGHT: ' + e.message + '\n')
    process.exit(1)
})

process.on('unhandledRejection', (e) => {
    process.stdout.write('UNHANDLED: ' + (e && e.message ? e.message : String(e)) + '\n')
    process.exit(1)
})

setTimeout(() => {
    process.stdout.write('TIMEOUT - exiting\n')
    process.exit(1)
}, 30000)

const ROLES = { USER: 'USER', ADMIN: 'ADMIN', SUPER_ADMIN: 'SUPER_ADMIN' }

const DEFAULT_EMAIL    = 'superadmin@ecommerce.com'
const DEFAULT_USERNAME = 'SuperAdmin'
const DEFAULT_PASSWORD = 'ChangeMe123!'

const userSchema = new mongoose.Schema(
    {
        username : { type: String, required: true, unique: true },
        email    : { type: String, required: true, unique: true, lowercase: true },
        password : { type: String, required: true },
        role     : { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    },
    { timestamps: true }
)

const User = mongoose.models.User || mongoose.model('User', userSchema)

const run = async () => {
    process.stdout.write('run() called\n')
    process.stdout.write('MONGO_URI present: ' + !!process.env.MONGO_URI + '\n')

    if (!process.env.MONGO_URI) {
        process.stdout.write('ERROR: MONGO_URI is not set in .env\n')
        process.exit(1)
    }

    try {
        process.stdout.write('Connecting to MongoDB...\n')

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS : 15000,
            connectTimeoutMS         : 15000,
            socketTimeoutMS          : 15000,
        })

        process.stdout.write('Connected to: ' + mongoose.connection.db.databaseName + '\n')

        const emailArg   = process.argv.find(a => a.startsWith('--email='))
        const targetEmail = emailArg ? emailArg.split('=')[1].trim() : null

        if (targetEmail) {
            process.stdout.write('Promoting user: ' + targetEmail + '\n')

            const user = await User.findOne({ email: targetEmail })
            if (!user) {
                process.stdout.write('ERROR: No user found with email: ' + targetEmail + '\n')
                process.exit(1)
            }

            await User.updateOne(
                { email: targetEmail },
                { $set: { role: ROLES.SUPER_ADMIN } }
            )
            process.stdout.write('SUCCESS: ' + targetEmail + ' is now SUPER_ADMIN\n')

        } else {
            process.stdout.write('Checking for existing SUPER_ADMIN...\n')

            const existing = await User.findOne({ role: ROLES.SUPER_ADMIN })
            if (existing) {
                process.stdout.write('SUPER_ADMIN already exists: ' + existing.email + '\n')
                process.stdout.write('No changes made.\n')
            } else {
                process.stdout.write('Creating new SUPER_ADMIN...\n')

                const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10)

                await User.create({
                    username : DEFAULT_USERNAME,
                    email    : DEFAULT_EMAIL,
                    password : hashed,
                    role     : ROLES.SUPER_ADMIN,
                })

                process.stdout.write('-----------------------------\n')
                process.stdout.write('SUPER_ADMIN CREATED\n')
                process.stdout.write('Email   : ' + DEFAULT_EMAIL + '\n')
                process.stdout.write('Password: ' + DEFAULT_PASSWORD + '\n')
                process.stdout.write('CHANGE PASSWORD AFTER FIRST LOGIN\n')
                process.stdout.write('-----------------------------\n')
            }
        }

    } catch (e) {
        process.stdout.write('ERROR: ' + e.message + '\n')
        if (e.code) process.stdout.write('CODE: ' + e.code + '\n')
        process.exit(1)
    } finally {
        await mongoose.disconnect()
        process.stdout.write('SEED COMPLETE\n')
        process.exit(0)
    }
}

run()
