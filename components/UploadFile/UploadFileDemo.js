import { View, Text, Button } from 'react-native'
import React, { useState } from 'react'
import * as DocumentPicker from 'expo-document-picker';
import api from '../Authorization/api';

export default function UploadFileDemo() {
    const [assets, setAssets] = useState([]);

    const pickSomething = async () => {
        try {
            const docRes = await DocumentPicker.getDocumentAsync({
                type: [
                    "audio/*",
                    "image/*",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
                    "application/vnd.ms-excel", // .xls
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
                    "application/pdf", // .pdf
                ],
                multiple: true
            });

            console.log(docRes);
            setAssets(docRes.assets);
        } catch (error) {
            console.log("Error while selecting file: ", error);
        }
    };

    const handleSubmit = async () => {
        const formData = new FormData();

        // Append the Thumbnail (assuming it's a file object and needs a specific Content-Type)
        formData.append('Thumbnail', {
            uri: assets[0].uri,
            name: assets[0].name,
            type: assets[0].mimeType
        });

        // Append each file in the assets array with explicit content type
        assets.forEach((file) => {
            formData.append('Images', {
                uri: file.uri,
                name: file.name,
                type: file.mimeType
            });
        });

        try {
            const response = await api.post('/Artwork', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',  // Ensure the content type is set correctly
                },
            });

            console.log('Artwork created:', response.data);
            alert("Upload Success")
        } catch (error) {
            if (error.response) {
                // Server responded with a status other than 2xx
                console.log('Response error:', error.response.data);
            } else if (error.request) {
                // Request was made but no response received
                console.log('Request error:', error.request);
            } else {
                // Something happened in setting up the request
                console.log('Error:', error.message);
            }
        }
    }

    return (
        <View>
            <Text>Number of file choose: {assets.length}</Text>
            <Button title="Pick something" onPress={pickSomething} />
            <Button title="Submit Files" onPress={handleSubmit} />
        </View>
    )
}