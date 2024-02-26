import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { toast } from "react-toastify";
import { doc, deleteDoc, onSnapshot, collection, addDoc, query, where, serverTimestamp, orderBy, Timestamp, setDoc, getDocs, getDoc, updateDoc  } from "firebase/firestore";
import { getStorage, ref, uploadBytes, deleteObject, getDownloadURL } from "firebase/storage";
import db from "./firebase";
import axios from 'axios';

export interface User {
    email: string | null,
    uid: string | null
}

export interface Bill {
	id: string;
	bimonthly: boolean;
	fixedAmount: boolean;
	fixedAmountV: number;
	fixedDay: boolean;
	fixedDayV: number;
	name: string;
	amount: number;
	day: number;
	file: boolean;
  }

  export interface BillLite {
	id: string;
	bimonthly: boolean;
	fixedAmount: boolean;
	fixedAmountV: number;
	fixedDay: boolean;
	fixedDayV: number;
	name: string;
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
			}
			if (collectionSize === 0 ) setFinished(true);	//it is finished after fetching all "amounts" docs for every collection entry, without this table will be rendered incomplete
            }));
		setBills(bills)
	} catch (err) {
		console.error(err)
		setBills([])
	}
}

export const saveBills = (date: string, newBills: Bill[]) => {
	try {
		newBills.forEach(async (element) => {
		await updateDoc(doc(db, "bills", element.id, 'amounts', date), {amount: element.amount, day: element.day});
		})
		successMessage("Zmiany pomyślnie zapisane 🎉")
	} catch(err) {
		console.error(err)
		errorMessage("Nie udało się zapisać zmian ❌")
	}

}

export const getBillsToManage = async (setBills: any, setFinished: any) => {
	try {
        const unsub = onSnapshot(collection(db, "bills"), doc => {
            const docs: any = []
            doc.forEach((d: any) => {
              docs.push( { ...d.data(), id: d.id })
            });
			setBills(docs);
			setFinished(true);
        }) 
	} catch (err) {
		console.error(err)
		setBills([])
	}
}

export const saveManagedBills = async (newBills: any) => {
	try {
		newBills.forEach(async (element:any) => {
			let reducedElement={...element};
			delete reducedElement.id;	//dont want redundant id field in db
			await setDoc(doc(db, "bills", element.id), reducedElement);
		})
		successMessage("Zmiany pomyślnie zapisane 🎉");
	} catch(err) {
		console.error(err);
		errorMessage("Nie udało się zapisać zmian ❌");
	}
}

export const deleteBill = async (id: string) => {
	try {
		await deleteDoc(doc(db, "bills", id));
		successMessage("Pomyślnie usunięto wpis🎉");
	} catch (err) {
		console.error(err)
		errorMessage("Nie udało się usunąć wpisu ❌");
	}
}

export const addBill = async () => {
	try {
		const docRef = await addDoc(collection(db, "bills"), {
			bimonthly: false,
			fixedAmount: false,
			fixedAmountV: 0,
			fixedDay: false,
			fixedDayV: 0,
			name: ''
			  });
		successMessage("Pomyślnie utworzono wpis🎉");
	}	catch (err) {
			console.error(err);
			errorMessage("Nie udało się utworzyć wpisu ❌");
	}
}

export const getPaid = async (date: string, setPaid: any) => {
	try {
		const docRef = doc(db, 'months', date);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			setPaid(docSnap.data().paid);
        } else {
			setPaid(false)
		} 
	} catch (err) {
		setPaid(false);
	}
}

export const setPaidBool = async (date: string, state: boolean) => {
	try {
		await setDoc(doc(db, "months", date), {paid: state});
		successMessage("Pomyślnie zmieiono stan opłacenia 🎉");
	}	catch (err) {
			console.error(err);
			errorMessage("Nie udało się zmienić stanu opłcaenia ❌");
	}
}

export const uploadFile = (file: File, date: string, id: string) => {
	const storage = getStorage();
	const storageRef = ref(storage, date+'/'+id+'.pdf');
	uploadBytes(storageRef, file).then(async (snapshot) => {	
		const billRef = doc(db, "bills", id, 'amounts', date);
		await updateDoc(billRef, {
			file: true
			});
		successMessage('Przesłano fakturę 🎉');
	}).catch((error) => {
		console.error(error);
		errorMessage("Nie udało się przesłać faktury ❌");
	});
}

export const downloadFile = (date:string, id:string, name:string) => {
	const storage = getStorage();
	try {
        getDownloadURL(ref(storage, date+'/'+id+'.pdf'))
		.then((url) => {
			axios({
				url: url,
				method: 'GET',
				responseType: 'blob',
			}).then((response) => {
				const href = URL.createObjectURL(response.data);
				// create "a" HTML element with href to file & click
				const link = document.createElement('a');
				link.href = href;
				link.setAttribute('download', name+'.'+date+'.pdf');
				document.body.appendChild(link);
				link.click();
				// clean up "a" element & remove ObjectURL
				document.body.removeChild(link);
				URL.revokeObjectURL(href);
			});
		})
    } catch (error) {
		console.error(error);
		errorMessage("Nie udało się pobrać faktury ❌");
    }
}

export const deleteFile = (date: string, id: string) => {
	const storage = getStorage();
	const desertRef = ref(storage, date+'/'+id+'.pdf');
	deleteObject(desertRef).then(async () => {
		const billRef = doc(db, "bills", id, 'amounts', date);
		await updateDoc(billRef, {
			file: false
			});
		successMessage('Faktura usunięta 🎉');
	}).catch((error) => {
		console.error(error);
		errorMessage("Nie udało się usunąć faktury ❌");
	});
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