# TLILO phone-motion revision 0.2.0

Status: WORKING CANDIDATE / UNSEALED. Authority: owner's October 2 request that the site move with the phone. TB-SUB remains unchanged.

This explicit revision replaces the earlier draft's no-device-orientation scope restriction for this artifact. The visitor may now opt into relative phone orientation using Enable motion, on both the experience and review page. The permission request happens directly in that click. No sensor permission is requested on load, no geolocation is used, no sensor data is stored or transmitted, and the authored NORTH bearing is not a claim of geographic north.

The device's back-facing direction is calculated from the orientation rotation matrix. Relative calibration avoids an initial camera jump; smoothing uses animation frames and shortest-angle turns. Dragging remains available and recalibrates the relative baseline. Center view resets tilt at the current heading. Motion can be switched off. Invalid readings are ignored, denied permission preserves dragging, missing readings produce browser guidance, and background-tab resumption recalibrates.

The canvas buffer is now resized only when its dimensions change, avoiding repeated allocation during motion rendering.

Validation: 26 local tests PASS, including direction math, portrait/landscape equivalence, invalid readings, permission denial, first-sample calibration, switching off, and existing temporal/release checks. Browser permission and physical iPhone sensor performance require owner-device verification; no claim that that check has happened.

References: https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static and https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent
