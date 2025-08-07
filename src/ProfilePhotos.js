import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, Typography, Avatar } from "@mui/material";

function ProfilePhotos() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      const querySnapshot = await getDocs(collection(db, "profile_photos"));
      setPhotos(querySnapshot.docs.map(doc => doc.data()));
    };
    fetchPhotos();
  }, []);

  return (
    <Card sx={{ marginTop: 2 }}>
      <CardContent>
        <Typography variant="h6">Profile Photos</Typography>
        {photos.length === 0 ? (
          <Typography>No photos found.</Typography>
        ) : (
          photos.map((photo, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
              <Avatar src={photo.photo_url} alt={photo.file_name} sx={{ marginRight: 2 }} />
              <div>
                <Typography>{photo.file_name}</Typography>
                <Typography variant="body2">{photo.uploaded_at}</Typography>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default ProfilePhotos;