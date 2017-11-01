
public class MyFirstClass {
	public static void main(String[] args) {
		//데이터 타입
		int i = 3;//자주사용
		short s = 1;
		byte b = 1;
		long l = 1L;
		float f = 1.1f;
		double d = 1.1;//자주사용
		boolean boo = true;//자주사용
		char c = '가';//자주사용
		System.out.println();
		String str = new String("가");
		String str1 = "가";
		String str2 = str;
		System.out.println(str==str1);
		System.out.println(str==str2);
		str = "나";
		System.out.println(str);
		System.out.println(str2);
		System.out.println(str==str2);
	}
}
