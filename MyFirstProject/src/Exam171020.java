
public class Exam171020 {
	//1번
	/*public static void main(String[] args) {
		String a = "#";
		for (int i = 0; i < 5; i++) {
			a=" ";
			for (int j = 0; j < 5; j++) {
				 a += "# ";
				 
			}
			System.out.println(a); 
			
		}

	}*/
	//2번
	/*public static void main(String[] args) {
		String a = "#";
		for (int i = 0; i < 7; i++) {
			if (i%2 == 1) {
				a = " ";	
			}else {
				a = "";
			}
			
			for (int j = 0; j < 7; j++) {

				a += "# ";
				
				
			}
			System.out.println(a);

			
		}
		
	}*/
	//3-a
	/*public static void main(String[] args) {
		String a = "";
		for (int i = 0; i < 8; i++) {
				a += "# ";
			
			System.out.println(a);
			
		}
	}*/
	//3-b
	/*public static void main(String[] args) {
		String a ="";
		String[] strArray = new String[8];
		for (int i = 0; i < 8; i++) {
			a += "# ";
			strArray[i] = a;
		}
		for (int j = 7; j >= 0; j--) {
			System.out.println(strArray[j]);
			}
				
		}*/
	//3-c
	/*public static void main(String[] args) {
		String a = "";
		String b = "";
		String[] strArray1 = new String[8];
		for (int i = 0; i < 8; i++) {
			a += " ";
			strArray1[i] = a;

		}
		for (int j = 7; j >= 0; j--) {
			b += "#";
			strArray1[j] += b;

		}
		for (int k = 0; k < 8; k++) {
			System.out.println(strArray1[k]);	
		}
		
	}*/
	//3-d
	public static void main(String[] args) {
		String a = "";
		String b = "";
		String[] strArray1 = new String[8];
		for (int i = 0; i < 8; i++) {
			a += " ";
			strArray1[i] = a;

		}
		for (int j = 7; j >= 0; j--) {
			b += "#";
			strArray1[j] += b;

		}
		for (int k = 7; k >= 0; k--) {
			System.out.println(strArray1[k]);	
		}
		
	}
}

