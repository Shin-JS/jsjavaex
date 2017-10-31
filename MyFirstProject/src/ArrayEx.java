
public class ArrayEx {
	public static void main(String[] args) {
		int[] myArray = new int[5];
		myArray[0] = 34;
		myArray[1] = 33;
		myArray[2] = 90;
		myArray[3] = 75;
		myArray[4] = 85;
	
		System.out.println(myArray[0]);
		System.out.println(myArray[1]);
		System.out.println(myArray[2]);
		System.out.println(myArray[3]);
		System.out.println(myArray[4]);
		
		byte[] byteArray = new byte[3];
		byteArray[0] = 5;

		
		System.out.println(byteArray[0]);
		System.out.println(byteArray[1]);
		System.out.println(byteArray[2]);
		
		
		int[] myArray2 = {2,3,-6};
		
		System.out.println(myArray2.length);
		
		String str = "오늘 날씨?";
		String[] strArray = new String[3];
		strArray[0] = "금요일";
		strArray[1] = "토요일";
		strArray[2] = "일요일";
		
		String[][] names = {
				{"Mr.", "Mrs.", "Ms."}, 
				{"Smith", "Jones"}
				};
		System.out.println(names[1][0]);
	}
}
