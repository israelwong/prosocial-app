'use server';

import { Image } from './types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);



export async function getImages(folderPath: string): Promise<Image[]> {
    const imagesInfo: Image[] = [];

    const { data } = await supabase.storage.from('ProSocial').list(
        folderPath
    );

    console.log(data);

    // const imagesInfo: Image[] = [];

    // for (const file of data) {
    //     if (file.name.endsWith('.jpg') || file.name.endsWith('.png')) {
    //         const { data: imageData, error: imageError } = await supabase.storage
    //             .from('your-bucket-name')
    //             .download(`${folderPath}/${file.name}`);



    //         const image = await createImageBitmap(imageData);
    //         imagesInfo.push({
    //             name: file.name,
    //             width: image.width,
    //             height: image.height,
    //         });
    //     }
    // }
    return imagesInfo;
}


