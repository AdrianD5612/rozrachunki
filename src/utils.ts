import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { toast } from "react-toastify";
import { doc, deleteDoc, onSnapshot, collection, addDoc, query, where, serverTimestamp, orderBy, Timestamp, setDoc } from "firebase/firestore";
import db from "./firebase";

export interface User {
    email: string | null,
    uid: string | null
}

export const getBills = async (setBills: any) => {
	try {
        const unsub = onSnapshot(collection(db, "bills"), doc => {
            const docs: any = []
            doc.forEach((d: any) => {
              docs.push( { ...d.data(), id: d.id })
            });
			setBills(docs)
			console.log(docs)
        }) 
	} catch (err) {
		console.error(err)
		setBills([])
	}
}

export const successMessage = (message:string) => {
	toast.success(message, {
		position: "top-right",
		autoClose: 5000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		progress: undefined,
		theme: "light",
	});
};
export const errorMessage = (message:string) => {
	toast.error(message, {
		position: "top-right",
		autoClose: 5000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		progress: undefined,
		theme: "light",
	});
};

export const LoginUser = (email: string, password: string, router: any) => {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            successMessage("Zalogowano 🎉");
            router.push("/");
        })
        .catch((error) => {
            console.error(error);
            errorMessage("Zły e-mail/hasło ❌");
        });
};

export const LogOut = (router: any) => {
	signOut(auth)
		.then(() => {
			successMessage("Wylogowano 🎉");
			router.push("/login");
		})
		.catch((error) => {
			errorMessage("Nie udało się wylogować ❌");
		});
};