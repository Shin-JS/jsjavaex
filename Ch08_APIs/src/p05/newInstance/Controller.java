package p05.newInstance;

import java.io.File;
import java.io.FileReader;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Properties;
import java.util.Scanner;
import java.util.Set;

public class Controller {
	static private Map<String,Action> map = new HashMap<String,Action>();
	public static void main(String[] args) {
	//command.properties의 정보를 저장할 객체 생성
		Properties props = new Properties(); //Properties: 맵의 한종류
		//File구분자"/","\\"
		File f = new File("src/p05/newInstance/command.properties");
		try {
			//file로부터 입력받은 객체(외부객체로 부터 정보를 입력받기위한 통로: FileReader)
			FileReader fis = new FileReader(f);
			//통로를 통해서 외부파일의 정보를 키와 값의 형태로 property객체에 저장하는게 load()메소드
			props.load(fis); //입력받은 객체로부터 property형식으로 값을 저장
			//property객체에는 키와 값으로 저장되어있고, 키가 중복이 되어있을 수 있기때문에 중복을 방지하는 Set에 키들만 다시 저장함
			Set keySet = props.keySet(); //키들만 set에 저장(Set: 자료의 중복X, 순서X)
			//순서가 없는 객체를 저장한 Set에서 값을 처음부터 끝까지 순회하면서 출력하기 위한 객체: Iterator
			//Iterator는 객체의 처음, 현재, 다음번지값만 저장
			Iterator keyItor = keySet.iterator(); //Iterator: 반복자
			while(keyItor.hasNext()) { //Set에 키가 존재하는지확인하는 메소드(hasNext())
				String command = (String)keyItor.next(); //존재하는 키를 가져오는 메소드(next())
				String className = props.getProperty(command);
				Class clazz;
				clazz = Class.forName(className); //문자열로 주어진 클래스를 메모리에 로딩하는 역할
				Action action = (Action)clazz.newInstance();//동적객체 생성
				//map에 저장:put(키, 값);
				map.put(command,action); //키와 값의 형태로 자료저장
			}
			System.out.println("명령어 입력");
			Scanner scanner = new Scanner(System.in);
			String commandStr = scanner.next();
			Action action = map.get(commandStr);
			action.execute();
		}catch(Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
