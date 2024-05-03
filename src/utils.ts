import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { toast } from "react-toastify";
import { doc, deleteDoc, onSnapshot, collection, addDoc, query, where, serverTimestamp, orderBy, Timestamp, setDoc, getDocs, getDoc, updateDoc  } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, deleteObject, getDownloadURL } from "firebase/storage";
import db from "./firebase";
import axios from 'axios';
import { getTranslation } from "./translations";

const t = (key: string) => getTranslation(key);

export interface User {
    email: string | null,
    uid: string | null
}

export interface BillLite {
	id: string;
	bimonthly: boolean;
	fixedAmount: boolean;
	fixedAmountV: number;
	fixedDay: boolean;
	fixedDayV: number;
	name: string;
	order: number;
}

export interface Bill extends BillLite {
	amount: number;
	day: number;
	file: boolean;
}

export interface MiscBill {
	id: string;
	name: string;
	amount: number;
	active: boolean;
	order: number;
}

function getUid() {
	return auth.currentUser? auth.currentUser.uid : 'error';
}

/**
 * Retrieves bills data from the database and updates the state accordingly.
 *
 * @param {string} date - the date for which to retrieve bills data
 * @param {any} setBills - the function to update the bills state
 * @param {any} setFinished - the function to update the finished state
 */
export const getBills = async (date:  string, setBills: any, setFinished: any) => {
	try {
		const uid = getUid();
		const bills: any = []
		const q = query(collection(db, uid+"Bills"));
		const querySnapshot = await getDocs(q);
		let collectionSize=querySnapshot.size;	//amount of different bills
		querySnapshot.forEach((async downloaded => {
			if (!downloaded.data().deleted) {
				const docRef = doc(db, uid+"Bills", downloaded.id, 'amounts', date);
				const docSnap = await getDoc(docRef);
				if (docSnap.exists()) {
					bills.push( { ...downloaded.data(), id: downloaded.id, ...docSnap.data() });
				} else {	//amount not yet exists
				bills.push( { ...downloaded.data(), id: downloaded.id} );
				}
			}
			collectionSize--;
			if (collectionSize === 0 ) {	//all bills have been fetched
				//fix null order fields
				bills.forEach((bill:any, index: number) => {
					if (!bill.hasOwnProperty('order') || bill.order === null || Number.isNaN(bill.order)) {
						bills[index].order = index;
					}
				});
				bills.sort((a:any, b:any) => a.order - b.order);
				setFinished(true);	//it is finished after fetching all "amounts" docs for every collection entry, without this table will be rendered incomplete
			}
			}));
		setBills(bills);
	} catch (err) {
		console.error(err)
		setBills([])
	}
}

/**
 * Save bills for a specific date. It will create corresponding month document if it doesn't exist yet.
 *
 * @param {string} date - the date for which the bills are being saved
 * @param {Bill[]} newBills - an array of new bills to be saved
 */
export const saveBills = async (date: string, newBills: Bill[]) => {
	try {
		const uid = getUid();
		newBills.forEach(async (element) => {
			await setDoc(doc(db, uid+"Bills", element.id, 'amounts', date), {amount: element.amount, day: element.day, file: element.file});
		})
		//creating blank month data too if not yet exists so unpaid scanning can detect it
		const docRef = doc(db, uid+'Months', date);
		const docSnap = await getDoc(docRef);
		if (!docSnap.exists()) {
			await setDoc(doc(db, uid+"Months", date), {paid: false, note: ''});
        } 
		successMessage(t("saveSuccess"));
	} catch(err) {
		console.error(err)
		errorMessage(t("saveFail"));
	}

}

/**
 * Asynchronous function to retrieve bills to manage and update the state accordingly.
 *
 * @param {any} setBills - function to set the bills state
 * @param {any} setFinished - function to set the finished state
 */
export const getBillsToManage = async (setBills: any, setFinished: any) => {
	try {
		const uid = getUid();
        const unsub = onSnapshot(collection(db, uid+"Bills"), doc => {
            const docs: any = []
            doc.forEach((d: any) => {
			  if (!d.data().deleted) {
				docs.push( { ...d.data(), id: d.id });
			  }
            });
			//fix null order fields
			docs.forEach((bill:any, index: number) => {
				if (!bill.hasOwnProperty('order') || bill.order === null || Number.isNaN(bill.order)) {
					docs[index].order = index;
				}
			});
			docs.sort((a:any, b:any) => a.order - b.order);
			setBills(docs);
			setFinished(true);
        }) 
	} catch (err) {
		console.error(err)
		setBills([])
	}
}

/**
 * Save managed bills to the database.
 *
 * @param {any} newBills - array of new bills to be saved
 */
export const saveManagedBills = async (newBills: any) => {
	try {
		const uid = getUid();
		newBills.forEach(async (element:any) => {
			let reducedElement={...element};
			delete reducedElement.id;	//dont want redundant id field in db
			await setDoc(doc(db, uid+"Bills", element.id), reducedElement);
		})
		successMessage(t("saveSuccess"));
	} catch(err) {
		console.error(err);
		errorMessage(t("saveFail"));
	}
}

/**
 * Asynchronously marks a bill as deleted from the database.
 *
 * @param {string} id - The ID of the bill to be marked as deleted
 */
export const deleteBill = async (id: string) => {
	try {
		const uid = getUid();
		await updateDoc(doc(db, uid+"Bills", id), {deleted: true}).then(() => {
			successMessage(t("deleteSuccess"));
		})
	} catch (err) {
		console.error(err)
		errorMessage(t("deleteFail"));
	}
}


/**
 * Async function to add a bill to the database.
 *
 * @param {number} nextOrder - The order of the next bill
 */
export const addBill = async (nextOrder: number) => {
	try {
		const uid = getUid();
		const docRef = await addDoc(collection(db, uid+"Bills"), {
			bimonthly: false,
			fixedAmount: false,
			fixedAmountV: 0,
			fixedDay: false,
			fixedDayV: 0,
			name: '',
			order: nextOrder
			  });
		successMessage(t("createSuccess"));
	}	catch (err) {
			console.error(err);
			errorMessage(t("createFail"));
	}
}

/**
 * Asynchronously retrieves data for a specific month and sets the 'paid' and 'note' state variables accordingly.
 *
 * @param {string} date - the date of the month to retrieve data for
 * @param {any} setPaid - function to set the 'paid' state variable
 * @param {any} setNote - function to set the 'note' state variable
 */
export const getMonthData = async (date: string, setPaid: any, setNote: any, setUnpaidMonths: any) => {
	try {
		const uid = getUid();
		const docRef = doc(db, uid+'Months', date);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			setPaid(docSnap.data().paid);
			docSnap.data().note? setNote(docSnap.data().note) : setNote('');
        } else {
			setPaid(false);
			setNote('');
		}
		const q = query(collection(db, uid+"Months"));
		const querySnapshot = await getDocs(q);
		const unpaidMonths: string[] = [];
		let collectionSize=querySnapshot.size;
		const currentDate = new Date();
		const currentMonth = currentDate.getMonth() + 1;
		const currentYear = currentDate.getFullYear();
		querySnapshot.forEach((async downloaded => {
			const downloadedMonth= parseInt(downloaded.id.split('.')[1]);
			const downloadedYear= parseInt(downloaded.id.split('.')[0]);
			if (downloadedMonth < currentMonth && downloadedYear <= currentYear) {
				if (downloaded.data().paid == false) unpaidMonths.push(downloaded.id);
			}
			collectionSize--;
			if (collectionSize == 0) {
				setUnpaidMonths(unpaidMonths);
			}
		}));

	} catch (err) {
		setPaid(false);
	}
}

/**
 * Function to set the paid status for a given date in the database.
 *
 * @param {string} date - the date for which to set the paid status
 * @param {boolean} state - the paid status to set
 */
export const setPaidBool = async (date: string, state: boolean) => {
	try {
		const uid = getUid();
		const docRef = doc(db, uid+'Months', date);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			await updateDoc(doc(db, uid+"Months", date), {paid: state});
			successMessage(t("paidSuccess"));
		} else {
			await setDoc(doc(db, uid+"Months", date), {paid: state});
			successMessage(t("paidSuccess"));
		}
	}	catch (err) {
			console.error(err);
			errorMessage(t("paidFail"));
	}
}

/**
 * Set a note for a specific month in the database.
 *
 * @param {string} date - the date of the month
 * @param {string} entry - the note to be set
 */
export const setMonthNote = async (date: string, entry: string) => {
	try {
		const uid = getUid();
		const docRef = doc(db, uid+'Months', date);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			await updateDoc(doc(db, uid+"Months", date), {note: entry});
			successMessage(t("noteSuccess"));
		} else {
			await setDoc(doc(db, uid+"Months", date), {note: entry});
			successMessage(t("noteSuccess"));
		}
	}	catch (err) {
			console.error(err);
			errorMessage(t("noteFail"));
	}
}

/**
 * Uploads a file to the storage and updates the bill document in the database.
 *
 * @param {File} file - The file to be uploaded
 * @param {string} date - The date of the bill
 * @param {string} id - The ID of the bill
 */
export const uploadFile = (file: File, date: string, id: string) => {
	const uid = getUid();
	const storage = getStorage();
	const storageRef = ref(storage, uid+'/'+date+'/'+id+'.pdf');
	const uploadTask = uploadBytesResumable(storageRef, file);
	uploadTask.on('state_changed',
		(snapshot) => {
			// Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
		}, 
		(error) => {
			// A full list of error codes is available at
			// https://firebase.google.com/docs/storage/web/handle-errors
			switch (error.code) {
			case 'storage/unauthorized':
				errorMessage(t("uploadFailSize"));
				break;
			case 'storage/canceled':
				errorMessage(t("uploadFailCancel"));
				break;
			case 'storage/unknown':
				errorMessage(t("uploadFail"));
				break;
			}
		}, 
		async () => {
			// success
			const billRef = doc(db, uid+"Bills", id, 'amounts', date);
			const docSnap = await getDoc(billRef);
			if (docSnap.exists()) {
				await updateDoc(billRef, {
					file: true
					});
				successMessage(t("uploadSuccess"));
			} else {
				await setDoc(billRef, {
					file: true
					});
				successMessage(t("uploadSuccess"));
			}
			}
	);
}

/**
 * Downloads a file from the storage using the provided date, id, and name.
 *
 * @param {string} date - the date of the file
 * @param {string} id - the id of the file
 * @param {string} name - the name of the file
 */
export const downloadFile = (date:string, id:string, name:string) => {
	const storage = getStorage();
	try {
		const uid = getUid();
        getDownloadURL(ref(storage, uid+'/'+date+'/'+id+'.pdf'))
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
		errorMessage(t("downloadFail"));
    }
}

/**
 * Deletes a file from storage and updates the corresponding bill document.
 *
 * @param {string} date - the date of the file
 * @param {string} id - the id of the file
 */
export const deleteFile = (date: string, id: string) => {
	const uid = getUid();
	const storage = getStorage();
	const desertRef = ref(storage, uid+'/'+date+'/'+id+'.pdf');
	deleteObject(desertRef).then(async () => {
		const billRef = doc(db, uid+"Bills", id, 'amounts', date);
		await updateDoc(billRef, {
			file: false
			});
		successMessage(t("deleteFileSuccess"));
	}).catch((error) => {
		console.error(error);
		errorMessage(t("deleteFileFail"));
	});
}

/**
 * Asynchronous function to fetch miscellaneous bills from the database and update the state with the retrieved data.
 *
 * @param {any} setBills - A function to set the state with the retrieved bills
 * @param {any} setFinished - A function to set the flag indicating that the data retrieval is finished
 */
export const getMiscBills = async (setBills: any, setFinished: any) => {
	try {
		const uid = getUid();
        const unsub = onSnapshot(collection(db, uid+"Misc"), doc => {
            const docs: any = []
            doc.forEach((d: any) => {
              docs.push( { ...d.data(), id: d.id })
            });
			//fix null order fields
			docs.forEach((bill:any, index: number) => {
				if (!bill.hasOwnProperty('order') || bill.order === null || Number.isNaN(bill.order)) {
					docs[index].order = index;
				}
			});
			docs.sort((a:any, b:any) => a.order - b.order);
			setBills(docs);
			setFinished(true);
        }) 
	} catch (err) {
		console.error(err)
		setBills([])
	}
}


/**
 * Function to add a miscellaneous bill to the database.
 *
 * @param {number} nextOrder - the order of the next bill
 */
export const addMiscBill = async (nextOrder: number) => {
	try {
		const uid = getUid();
		const docRef = await addDoc(collection(db, uid+"Misc"), {
			amount: 0,
			active: true,
			name: '',
			order: nextOrder
			  });
		successMessage(t("createSuccess"));
	}	catch (err) {
			console.error(err);
			errorMessage(t("createFail"));
	}
}

/**
 * Delete a miscellaneous bill by ID.
 *
 * @param {string} id - The ID of the bill to be deleted
 */
export const deleteMiscBill = async (id: string) => {
	try {
		const uid = getUid();
		await deleteDoc(doc(db, uid+"Misc", id));
		successMessage(t("deleteSuccess"));
	} catch (err) {
		console.error(err)
		errorMessage(t("deleteFail"));
	}
}

/**
 * Save miscellaneous bills to the database
 *
 * @param {any} newBills - array of new bills to be saved
 */
export const saveMiscBills = async (newBills: any) => {
	try {
		const uid = getUid();
		newBills.forEach(async (element:any) => {
			let reducedElement={...element};
			delete reducedElement.id;	//dont want redundant id field in db
			await setDoc(doc(db, uid+"Misc", element.id), reducedElement);
		})
		successMessage(t("saveSuccess"));
	} catch(err) {
		console.error(err);
		errorMessage(t("saveFail"));
	}
}

export const getChartData = async (setChartData: any, setNames: any, setFinished: any) => {
	try {
		const uid = getUid();
		const data: any = [];
		const names: String[] = [];
		const q = query(collection(db, uid+"Bills"));
		const querySnapshot = await getDocs(q);
		let collectionSize=querySnapshot.size;	//amount of all bills
		var i=0;	//count of current data entry, skipping deleted ones
		querySnapshot.forEach((async downloaded => {
			if (!downloaded.data().deleted) {
				names.push(downloaded.data().name);
				data[data.length] = [];
				const qq = query(collection(db, uid+"Bills", downloaded.id, 'amounts'));
				const queryAmountsSnapshot = await getDocs(qq);
				if (queryAmountsSnapshot.size > 0) {
					queryAmountsSnapshot.forEach((async downloaded => {
						if (downloaded.data().amount) {
							data[i].push( { label: downloaded.id, y: downloaded.data().amount } );
						}
					}));
				}
				i++;
			}
			collectionSize--;
			if (collectionSize === 0 ) {	//all bills have been fetched
				setFinished(true);
			}
			}));
		setChartData(data);
		setNames(names);
	} catch (err) {
		console.error(err);
		setChartData([]);
		setNames([]);
		setFinished(true);
	}
}

/**
 * Displays a success message using the toast library.
 *
 * @param {string} message - The message to be displayed
 */
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
/**
 * Displays an error message using a toast notification.
 *
 * @param {string} message - The error message to be displayed
 */
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

/**
 * Logs in the user with the provided email and password.
 *
 * @param {string} email - the user's email
 * @param {string} password - the user's password
 * @param {any} router - the router object for navigation
 */
export const LoginUser = (email: string, password: string, router: any) => {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            successMessage(t("loginSuccess"));
            router.push("/");
        })
        .catch((error) => {
            console.error(error);
            errorMessage(t("loginFail"));
        });
};

/**
 * Logs the user out and navigates to the login page.
 *
 * @param {any} router - the router object for navigation
 */
export const LogOut = (router: any) => {
	signOut(auth)
		.then(() => {
			successMessage(t("logoutSuccess"));
			router.push("/login");
		})
		.catch((error) => {
			errorMessage(t("logoutFail"));
		});
};