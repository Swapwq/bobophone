import { createClient } from "../../lib/supabase";

export default async function NewMessage(senderId? : string) {
    const supabase = createClient();

    await supabase.from('message').insert([
        {
            chat_id: '2f198b6b-69df-4b1a-b09a-84cba74a5ed2',
            sender_id: senderId,
            content: 'message'
        }
    ]);

}