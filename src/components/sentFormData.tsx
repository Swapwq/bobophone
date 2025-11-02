'use server'

import { prisma } from '../../lib/prisma';

export default async function SentFormData(email: string, password: string, username: string, userId: string) {
    try {
        // Check if user already exists in public_users table
        const existingUser = await prisma.public_users.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log('[SentFormData] User already exists:', email);
            return { success: false, error: 'User already exists' };
        }

        // Create user in public_users table with the auth user ID
        const newUser = await prisma.public_users.create({
            data: {
                email,
                password,
                username,
                id: userId
            }
        });

        console.log('[SentFormData] User created successfully:', newUser);
        return { success: true, user: newUser };
    } catch (error) {
        console.error('[SentFormData] Error creating user:', error);
        return { success: false, error: String(error) };
    }
}