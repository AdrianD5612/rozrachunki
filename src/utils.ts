import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { toast } from "react-toastify";
import { doc, deleteDoc, onSnapshot, collection, addDoc, query, where, serverTimestamp, orderBy, Timestamp, setDoc, getDocs, getDoc  } from "firebase/firestore";
import db from "./firebase";

export interface User {
    email: string | null,
    uid: string | null
}

export const getBills = async (date:  string, setBills: any, setFinished: any) => {
	try {
		const bills: any = []
		const q = query(collection(db, "bills"));
		const querySnapshot = await getDocs(q);
		let collectionSize=querySnapshot.size;	//amount of different bills
		querySnapshot.forEach((async downloaded => {
			const docRef = doc(db, 'bills' , downloaded.id, 'amounts', date);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				bills.push( { ...downloaded.data(), id: downloaded.id, ...docSnap.data() });
				collectionSize--;
			} else {	//amount not yet exists
			bills.push( { ...downloaded.data(), id: downloaded.id} );
			collectionSize--;
			//TODO push json z wartosciami pustymi i handle to pozniej
			}
			if (collectionSize === 0 ) setFinished(true);	//it is finished after fetching all "amounts" docs for every collection entry, without this table will be rendered incomplete
            }));
		setBills(bills)
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