package referenceType;

public class FieldEx {
	//fields (instance variables)
	public int i = 3; //초기값은 primitive data는 0또는 false
	public float f = 3.0F;
	public String str = "field"; //참조형데이터 타입의 초기값은 null
	
	//static variable (class variable)
	public static int num = 10;
	
	public static void main(String[] args) {
		
		/*int local;
		System.out.println(local);*/ //에러남
		FieldEx fieldEx = new FieldEx();
		System.out.println(fieldEx.i);
		System.out.println(fieldEx.f);
		System.out.println(fieldEx.str);
		
		FieldEx fieldEx2 = new FieldEx();
		System.out.println(fieldEx2.i);
		System.out.println(fieldEx2.f);
		System.out.println(fieldEx2.str);
		
		fieldEx2.i = 5;//fieldEx2의 값만 바뀜
		
		System.out.println(fieldEx2.i);
		System.out.println(fieldEx.i);
		
		System.out.println(fieldEx.num);
		System.out.println(fieldEx2.num);
		
		fieldEx2.num = 20;//값이 다 바뀜
		
		System.out.println(fieldEx.num);
		System.out.println(fieldEx2.num);
		
		FieldEx.num = 30;//이렇게도 사용가능
		
		System.out.println(fieldEx.num);
		System.out.println(fieldEx2.num);
				
	}
}
