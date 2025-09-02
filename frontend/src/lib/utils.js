import avatar from "../assets/avatar.png";

export function formatMessageTime(date){
    return new Date(date).toLocaleTimeString("en-US", {
        hour:"2-digit",
        minute:"2-digit",
        hour12:false
    })
}

export const requestNotificationPermission = () => {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
};

export const showNotification = (title, body) => {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted" && document.hidden) {
    new Notification(title, {
      body,
      icon: avatar, 
    });
  }
};
