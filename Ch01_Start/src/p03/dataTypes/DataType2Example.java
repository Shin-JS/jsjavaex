package p03.dataTypes;

public class DataType2Example {
	public static void main(String[] args) {
		int i = Integer.MAX_VALUE; //int의 최고값 MIN_VALUE,MAX_VALUE가 static이므로 Integer.MAX_VALUE로 사용가능
		int j = Integer.MAX_VALUE; //int의 최고값
	
		System.out.println(i);
		System.out.println(j);
		System.out.println(i + j); //-2가 나오는 이유는 범위를 벗어났기때문

		byte var1 = 127;  //byte타입은 최소값이 -128, 최대값이 127
		for (int k = 1; k <=500; k++) {  //-128부터 127까지 계속 반복되는 코드
			System.out.println(var1++);//
		}
		
	}
}
