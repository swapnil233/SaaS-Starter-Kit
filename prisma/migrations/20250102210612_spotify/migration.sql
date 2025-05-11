-- CreateTable
CREATE TABLE "SpotifyPlay" (
    "id" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL,
    "platform" TEXT,
    "msPlayed" INTEGER,
    "connCountry" TEXT,
    "ipAddr" TEXT,
    "trackName" TEXT,
    "albumArtistName" TEXT,
    "albumName" TEXT,
    "spotifyTrackUri" TEXT,
    "episodeName" TEXT,
    "episodeShowName" TEXT,
    "spotifyEpisodeUri" TEXT,
    "reasonStart" TEXT,
    "reasonEnd" TEXT,
    "shuffle" BOOLEAN,
    "skipped" BOOLEAN,
    "offline" BOOLEAN,
    "offlineTimestamp" INTEGER,
    "incognitoMode" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotifyPlay_pkey" PRIMARY KEY ("id")
);
